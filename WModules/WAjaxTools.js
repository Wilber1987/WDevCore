//@ts-check
import { WSecurity } from "../Security/WSecurity.js";
import { LoadinModal } from "../WComponents/LoadinModal.js";
import { ModalMessage } from "../WComponents/ModalMessage.js";
import { WAlertMessage } from "../WComponents/WAlertMessage.js";

/**
 * 🛡️ COLA DE PETICIONES (Request Queue)
 * Controla cuántas peticiones HTTP se ejecutan simultáneamente.
 * Ajusta MAX_CONCURRENT según la capacidad de tu servidor. 
 * (1 = Secuencial estricto, 3 = Recomendado para HTTP/2)
 */
class RequestQueue {
    static MAX_CONCURRENT = 3; 
    static activeCount = 0;
    static waitingQueue = [];

    // Solicitar un turno para hacer una petición
    static async acquire() {
        if (this.activeCount < this.MAX_CONCURRENT) {
            this.activeCount++;
            return;
        }
        // Si la cola está llena, esperar turno
        return new Promise(resolve => {
            this.waitingQueue.push(resolve);
        });
    }

    // Liberar el turno cuando la petición termina (o va a esperar para reintentar)
    static release() {
        this.activeCount--;
        // Si hay peticiones esperando y hay espacio, despertar a la siguiente
        if (this.waitingQueue.length > 0 && this.activeCount < this.MAX_CONCURRENT) {
            this.activeCount++;
            const nextResolve = this.waitingQueue.shift();
            nextResolve();
        }
    }
}

class PostConfig {
    /**
    * @param {Partial<PostConfig>} [props] 
    */
    constructor(props) {
        Object.assign(this, props);
    }
    /**  @type {String | undefined} */ RequestType = "POST";
    /**  @type {String | undefined} */ HeaderType = "json";
    /**  @type {String | undefined} */ CSRFToken = "";
    /**  @type {boolean} */ WithoutLoading = false;
    /**  @type {Array<{name:string, value:string}>} */ headers;
}

class WAjaxTools {
    /**
    * @param {String} Url
    * @param {Object.<string, any>} [Data]
    * @param {Partial<PostConfig>} [postConfig]
    * @param {number} [maxRetries]
    * @returns {Promise<any>}
    */
    static Request = async (Url, Data = {}, postConfig, maxRetries = 3) => {
        const loadinModal = new LoadinModal();
        let isComplete = false;
        let attemptsMade = 0;

        // Timeout para mostrar el modal de carga
        const loadingTimeout = setTimeout(() => {
            if (!postConfig?.WithoutLoading && !isComplete) {
                document.body.appendChild(loadinModal);
            }
        }, 2000);

        // Función recursiva que maneja un intento individual de petición
        const executeAttempt = async () => {
            // 1. 🚦 ESPERAR TURNO EN LA COLA
            await RequestQueue.acquire();
            
            let response = null;
            let networkError = null;

            try {
                const config = WAjaxTools.BuildConfigRequest(postConfig, Data);
                // 2. 🚀 EJECUTAR FETCH (Aquí es donde se ocupa el ancho de banda)
                response = await fetch(Url, config);
            } catch (err) {
                networkError = err;
            } finally {
                // 3. 🟢 LIBERAR TURNO INMEDIATAMENTE
                // Liberamos el slot en cuanto el navegador recibe respuesta (o error de red).
                // Así, si toca esperar para reintentar, no bloqueamos a otras peticiones.
                RequestQueue.release();
            }

            // --- MANEJO DE ERRORES DE RED (TypeError: Failed to fetch) ---
            if (networkError) {
                if (attemptsMade < maxRetries) {
                    const waitTime = 1000 * Math.pow(2, attemptsMade);
                    console.warn(`🌐 [Cola] Error de red. Esperando ${waitTime}ms para reintentar... (Libera cola)`);
                    await new Promise(r => setTimeout(r, waitTime));
                    attemptsMade++;
                    return executeAttempt(); // Vuelve a pedir turno en la cola
                }
                throw networkError;
            }

            // --- MANEJO DE 503 (Middleware de Resiliencia SQL) ---
            if (response.status === 503) {
                if (attemptsMade < maxRetries) {
                    const retryAfter = response.headers.get('Retry-After');
                    const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : (1000 * Math.pow(2, attemptsMade));
                    console.warn(`⏳ [Cola] BD Saturada (503). Esperando ${waitTime}ms... (Libera cola)`);
                    await new Promise(r => setTimeout(r, waitTime));
                    attemptsMade++;
                    return executeAttempt(); // Vuelve a pedir turno
                }
                const errorData = await response.json().catch(() => ({ message: "Base de datos no disponible." }));
                throw new Error(errorData.message || "El servicio está saturado.");
            }

            // --- RESPUESTA EXITOSA O ERROR HTTP DEFINITIVO ---
            if (response.ok) {
                return await WAjaxTools.ProcessRequest(response, Url);
            } else {
                await WAjaxTools.HandleHttpError(response);
            }
        };

        try {
            // Iniciar el ciclo de intentos
            const result = await executeAttempt();
            clearTimeout(loadingTimeout);
            loadinModal.close();
            isComplete = true;
            return result;
        } catch (error) {
            clearTimeout(loadingTimeout);
            loadinModal.close();
            isComplete = true;
            
            console.error(`❌ [WAjaxTools] Error final tras ${attemptsMade} intentos:`, error);
            const errorMessage = error?.message?.includes("Failed to fetch") 
                ? "Error de conexión con el servidor." 
                : (error?.message || "Error inesperado.");
                
            WAlertMessage.Danger(errorMessage, true);
            throw error;
        }
    };

    static HandleHttpError = async (response) => {
        const messageError = await response.text();
        const lineas = messageError.split(/\r?\n/);
        console.error(`[HTTP Error ${response.status}]`, lineas);
        if(lineas[0]) {
            document.body.append(ModalMessage(lineas[0]));
            throw new Error(WAjaxTools.ProcessError(lineas[0]));
        }
        throw new Error(`Error HTTP ${response.status}`);
    }

    static PostRequest = async (Url, Data = {}, postConfig = new PostConfig()) => {
        postConfig.RequestType = "POST";
        return await WAjaxTools.Request(Url, Data, postConfig);
    }

    static GetRequest = async (Url, maxRetries = 3) => {
        const postConfig = new PostConfig({ RequestType: "GET" });
        try {
            return await WAjaxTools.Request(Url, {}, postConfig, maxRetries);
        } catch (error) {
            if (error.message?.includes("Failed to fetch")) {
                return WAjaxTools.LocalData(Url);
            }
            throw error;
        }
    }

    static ProcessRequest = async (response, Url) => {
        try {
            const text = await response.text();
            if (text.trim().length === 0) return null;

            if (text.length < 1024 * 1024 * 2) {
                try { localStorage.setItem(Url, text); } 
                catch (e) { console.warn(`localStorage lleno o error: ${Url}`); }
            }
            return JSON.parse(text);
        } catch (error) {
            console.log(`Error procesando JSON de ${Url}`);
            return null;
        }
    }

    static BuildConfigRequest(postConfig = new PostConfig(), Data) {
        let ContentType = postConfig.HeaderType === HeaderType.FORM 
            ? "application/x-www-form-urlencoded; charset=UTF-8" 
            : "application/json; charset=utf-8";
            
        let dataRequest = {
            method: postConfig.RequestType,
            headers: { 'Content-Type': ContentType, 'Accept': '*/*', dataType: 'json' }
        };
        if (postConfig.RequestType === RequestType.POST) {
            dataRequest.body = JSON.stringify(Data ?? {});
        }
        if (postConfig.CSRFToken) dataRequest.headers['X-CSRF-TOKEN'] = postConfig.CSRFToken;
        if (postConfig.headers) postConfig.headers.forEach(h => dataRequest.headers[h.name] = h.value);
        return dataRequest;
    }

    static ProcessError(string) {
        return string.toUpperCase().replace("SYSTEM.EXCEPTION", "ERROR");
    }

    static LocalData = (Url) => {
        const local = localStorage.getItem(Url);
        return local ? JSON.parse(local) : {};
    }
}

export { WAjaxTools };

const RequestType = { GET: "GET", POST: "POST", PUT: "PUT", DELETE: "DELETE" }
const HeaderType = { JSON: "json", FORM: "form" }