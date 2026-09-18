//@ts-check
import { WSecurity } from "../Security/WSecurity.js";
import { LoadinModal } from "../WComponents/LoadinModal.js";
import { ModalMessage } from "../WComponents/ModalMessage.js";
import { WAlertMessage } from "../WComponents/WAlertMessage.js";

/**
 * 🛡️ COLA DE PETICIONES (Request Queue)
 */
class RequestQueue {
    static MAX_CONCURRENT = 3; 
    static activeCount = 0;
    /**
     * @type {((value: any) => void)[]}
     */
    static waitingQueue = [];

    static async acquire() {
        if (this.activeCount < this.MAX_CONCURRENT) {
            this.activeCount++;
            return;
        }
        return new Promise(resolve => {
            this.waitingQueue.push(resolve);
        });
    }

    static release() {
        this.activeCount--;
        if (this.waitingQueue.length > 0 && this.activeCount < this.MAX_CONCURRENT) {
            this.activeCount++;
            const nextResolve = this.waitingQueue.shift();
            // @ts-ignore
            nextResolve();
        }
    }
}

class PostConfig {
    /**
     * @param {{ RequestType: string; } | undefined} [props]
     */
    constructor(props) { Object.assign(this, props); }
    RequestType = "POST";
    HeaderType = "json";
    CSRFToken = "";
    WithoutLoading = false;
    /**
     * @type {any[]}
     */
    // @ts-ignore
    headers;
}

class WAjaxTools {
    // 🧠 CACHE DE PETICIONES EN VUELO (Single-Flight / Deduplication)
    static inFlightRequests = new Map();

    /**
     * Proxy de Deduplicación. Si la petición ya existe, comparte la Promesa.
     */
    static Request = async (/** @type {RequestInfo | URL} */ Url, Data = {}, /** @type {PostConfig | undefined} */ postConfig, maxRetries = 3) => {
        const method = postConfig?.RequestType || 'POST';
        
        // 1. Generar una "Firma" única para esta petición
        let bodyString = '';
        try {
            // Evitamos stringify en FormData (subidas de archivos) o datos circulares
            if (method !== 'GET' && !(Data instanceof FormData) && Data !== null && Data !== undefined) {
                bodyString = JSON.stringify(Data);
            }
        } catch (e) {
            bodyString = 'complex_object';
        }

        const requestKey = `${method}:${Url}:${bodyString}`;

        // 🔗 DEDUPLICACIÓN: Si ya hay una petición idéntica en curso, compartimos su Promesa
        if (WAjaxTools.inFlightRequests.has(requestKey)) {
            console.log(`🔗 [Dedup] Petición duplicada detectada. Compartiendo respuesta para: ${Url}`);
            return WAjaxTools.inFlightRequests.get(requestKey);
        }

        // 🚀 Si no está en curso, creamos la promesa de ejecución real
        const executionPromise = WAjaxTools._executeNetworkRequest(Url, Data, postConfig, maxRetries);
        
        // La registramos en el mapa
        WAjaxTools.inFlightRequests.set(requestKey, executionPromise);

        // 🧹 La eliminamos del mapa cuando termine (ya sea éxito o error)
        executionPromise.finally(() => {
            WAjaxTools.inFlightRequests.delete(requestKey);
        });

        return executionPromise;
    };

    /**
     * Lógica interna de red (Cola, Reintentos, Fetch)
     */
    static _executeNetworkRequest = async (/** @type {RequestInfo | URL} */ Url, 
        /** @type {{}} */ Data, 
        /** @type {PostConfig | undefined} */ postConfig, 
        /** @type {number} */ maxRetries) => {
        const loadinModal = new LoadinModal();
        let isComplete = false;
        let attemptsMade = 0;

        const loadingTimeout = setTimeout(() => {
            if (!postConfig?.WithoutLoading && !isComplete) {
                document.body.appendChild(loadinModal);
            }
        }, 2000);

        const executeAttempt = async () => {
            await RequestQueue.acquire();
            
            let response = null;
            let networkError = null;

            try {
                const config = WAjaxTools.BuildConfigRequest(postConfig, Data);
                response = await fetch(Url, config);
            } catch (err) {
                networkError = err;
            } finally {
                RequestQueue.release();
            }

            if (networkError) {
                if (attemptsMade < maxRetries) {
                    const waitTime = 1000 * Math.pow(2, attemptsMade);
                    console.warn(`🌐 [Cola] Error de red. Esperando ${waitTime}ms...`);
                    await new Promise(r => setTimeout(r, waitTime));
                    attemptsMade++;
                    return executeAttempt();
                }
                throw networkError;
            }

            if (response?.status === 503) {
                if (attemptsMade < maxRetries) {
                    const retryAfter = response.headers.get('Retry-After');
                    const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : (1000 * Math.pow(2, attemptsMade));
                    console.warn(`⏳ [Cola] BD Saturada (503). Esperando ${waitTime}ms...`);
                    await new Promise(r => setTimeout(r, waitTime));
                    attemptsMade++;
                    return executeAttempt();
                }
                const errorData = await response.json().catch(() => ({ message: "Base de datos no disponible." }));
                throw new Error(errorData.message || "El servicio está saturado.");
            }

            if (response?.ok) {
                return await WAjaxTools.ProcessRequest(response, Url);
            } else {
                await WAjaxTools.HandleHttpError(response);
            }
        };

        try {
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
            // @ts-ignore
            const errorMessage = error?.message?.includes("Failed to fetch") 
                ? "Error de conexión con el servidor." 
                // @ts-ignore
                : (error?.message || "Error inesperado.");
                
            WAlertMessage.Danger(errorMessage, true);
            throw error;
        }
    };

    static HandleHttpError = async (/** @type {Response | null} */ response) => {
        const messageError = await response?.text();
        const lineas = messageError?.split(/\r?\n/);
        console.error(`[HTTP Error ${response?.status}]`, lineas);
        // @ts-ignore
        if(lineas[0]) {
            // @ts-ignore
            document.body.append(ModalMessage(lineas[0]));
            // @ts-ignore
            throw new Error(WAjaxTools.ProcessError(lineas[0]));
        }
        throw new Error(`Error HTTP ${response?.status}`);
    }

    static PostRequest = async (/** @type {string} */ Url, Data = {}, postConfig = new PostConfig()) => {
        postConfig.RequestType = "POST";
        return await WAjaxTools.Request(Url, Data, postConfig);
    }

    static GetRequest = async (/** @type {any} */ Url, maxRetries = 3) => {
        const postConfig = new PostConfig({ RequestType: "GET" });
        try {
            return await WAjaxTools.Request(Url, {}, postConfig, maxRetries);
        } catch (error) {
            // @ts-ignore
            if (error.message?.includes("Failed to fetch")) {
                return WAjaxTools.LocalData(Url);
            }
            throw error;
        }
    }

    static ProcessRequest = async (/** @type {Response} */ response, /** @type {RequestInfo | URL} */ Url) => {
        try {
            const text = await response.text();
            if (text.trim().length === 0) return null;

            if (text.length < 1024 * 1024 * 2) {
                // @ts-ignore
                try { localStorage.setItem(Url, text); } 
                catch (e) { console.warn(`localStorage lleno o error: ${Url}`); }
            }
            return JSON.parse(text);
        } catch (error) {
            console.log(`Error procesando JSON de ${Url}`);
            return null;
        }
    }

    /**
     * @param {{}} Data
     */
    static BuildConfigRequest(postConfig = new PostConfig(), Data) {
        let ContentType = postConfig.HeaderType === HeaderType.FORM 
            ? "application/x-www-form-urlencoded; charset=UTF-8" 
            : "application/json; charset=utf-8";
            
        let dataRequest = {
            method: postConfig.RequestType,
            headers: { 'Content-Type': ContentType, 'Accept': '*/*', dataType: 'json' }
        };
        if (postConfig.RequestType === RequestType.POST) {
            // @ts-ignore
            dataRequest.body = JSON.stringify(Data ?? {});
        }
        // @ts-ignore
        if (postConfig.CSRFToken) dataRequest.headers['X-CSRF-TOKEN'] = postConfig.CSRFToken;
        // @ts-ignore
        if (postConfig.headers) postConfig.headers.forEach(h => dataRequest.headers[h.name] = h.value);
        return dataRequest;
    }

    /**
     * @param {string} string
     */
    static ProcessError(string) {
        return string.toUpperCase().replace("SYSTEM.EXCEPTION", "ERROR");
    }

    static LocalData = (/** @type {string} */ Url) => {
        const local = localStorage.getItem(Url);
        return local ? JSON.parse(local) : {};
    }
}

export { WAjaxTools };

const RequestType = { GET: "GET", POST: "POST", PUT: "PUT", DELETE: "DELETE" }
const HeaderType = { JSON: "json", FORM: "form" }