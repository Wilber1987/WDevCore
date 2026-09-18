// WSocketServices.js
// Una sola conexión SignalR por hub, compartida por todos los componentes.
// Misma firma pública que la versión anterior: InitSignalR / StopSignalR.

const hubs = new Map(); // signalName -> hub

const RETRY_DELAYS = [0, 2000, 5000, 10000, 30000]; // ms; el último valor se repite
const STOP_GRACE_MS = 5000; // espera antes de cerrar un hub sin suscriptores

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const delayFor = (attempt) => {
    const base = RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)];
    return base ? base + Math.random() * 1000 : 0; // jitter para no reconectar todos a la vez
};

function createHub(signalName, options) {
    // @ts-ignore
    const { HubConnectionBuilder, HttpTransportType, LogLevel } = window.signalR;

    const urlOptions = {
        accessTokenFactory: () => localStorage.getItem("token") || null
    };

    if (options.webSocketsOnly) {
        // Evita el POST /negotiate en cada (re)conexión.
        // Solo activar si el servidor y el proxy permiten WebSockets directos.
        urlOptions.skipNegotiation = true;
        urlOptions.transport = HttpTransportType.WebSockets;
    }

    const connection = new HubConnectionBuilder()
        .withUrl("/" + signalName, urlOptions)
        .withAutomaticReconnect({
            // Nunca devuelve null: no se rinde después de 4 intentos como el default
            nextRetryDelayInMilliseconds: (ctx) => delayFor(ctx.previousRetryCount)
        })
        .configureLogging(LogLevel.Warning)
        .build();

    const hub = {
        name: signalName,
        connection,
        subs: new Set(),
        startPromise: null,
        stopTimer: null,
        disposed: false
    };

    connection.on("ReadSignal", (mensaje) => {
        hub.subs.forEach((sub) => {
            if (!sub.action) return;
            try {
                sub.action(mensaje);
            } catch (e) {
                console.error("Error en handler de ReadSignal:", e);
            }
        });
    });

    connection.on("Error", (error) => {
        console.error("Error SignalR:", error);
    });

    connection.onreconnecting((err) => {
        console.warn("SignalR reconectando…", err?.message);
    });

    connection.onreconnected(() => {
        console.log("SignalR reconectado");
        // Durante la caída se pudieron perder mensajes: avisar para que refresquen datos
        hub.subs.forEach((sub) => {
            try {
                sub.onReconnected?.();
            } catch (e) {
                console.error("Error en onReconnected:", e);
            }
        });
    });

    connection.onclose((err) => {
        if (hub.disposed) return; // cierre intencional
        console.warn("SignalR cerrado inesperadamente", err?.message);
        setTimeout(() => ensureStarted(hub), 5000);
    });

    return hub;
}

// Reintenta start() hasta lograrlo (start() inicial NO se reintenta solo).
async function startWithRetry(hub) {
    let attempt = 0;
    while (!hub.disposed) {
        const state = hub.connection.state;

        if (state === "Connected") return;

        if (state === "Disconnected") {
            try {
                await hub.connection.start();
                console.log("SignalR conectado");
                return;
            } catch (err) {
                console.error("Error al conectar SignalR:", err);
                await sleep(delayFor(++attempt));
                continue;
            }
        }

        // Connecting / Reconnecting / Disconnecting: lo maneja SignalR, solo esperamos
        await sleep(500);
    }
}

function ensureStarted(hub) {
    if (hub.disposed) return Promise.resolve();
    if (!hub.startPromise) {
        hub.startPromise = startWithRetry(hub).finally(() => {
            hub.startPromise = null;
        });
    }
    return hub.startPromise;
}

// Al volver a la pestaña o recuperar red, revivir hubs caídos
function resumeAll() {
    hubs.forEach((hub) => {
        if (hub.connection.state === "Disconnected") ensureStarted(hub);
    });
}
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") resumeAll();
});
window.addEventListener("online", resumeAll);

export class WSocketServices {
    constructor() {}

    /**
     * @param {any} manager  objeto que contendrá connection / hubStarted (compatibilidad)
     * @param {(mensaje:any)=>void} action  se ejecuta con cada ReadSignal
     * @param {string} signalName  nombre del hub
     * @param {{ onReconnected?: ()=>void, webSocketsOnly?: boolean }} options
     */
    static async InitSignalR(manager, action, signalName = "chatHub", options = {}) {
        // @ts-ignore
        if (!window.signalR) {
            console.error("signalR no está cargado");
            return;
        }
        if (manager.signalSub) return; // este manager ya está suscrito

        let hub = hubs.get(signalName);
        if (!hub) {
            hub = createHub(signalName, options);
            hubs.set(signalName, hub);
        }

        // Si estaba en período de gracia para cerrarse, cancelar el cierre
        clearTimeout(hub.stopTimer);
        hub.stopTimer = null;

        const sub = { signalName, action, onReconnected: options.onReconnected };
        hub.subs.add(sub);

        // Se asigna antes del await: evita la condición de carrera de la versión anterior
        manager.signalSub = sub;
        manager.connection = hub.connection;

        await ensureStarted(hub);

        if (manager.signalSub === sub) {
            manager.hubStarted = hub.connection.state === "Connected";
        }
    }

    /**
     * Desuscribe al manager. La conexión solo se cierra si nadie más la usa
     * y tras un período de gracia (evita cerrar/abrir en cada navegación).
     */
    static async StopSignalR(manager, { immediate = false } = {}) {
        const sub = manager?.signalSub;
        if (!sub) return;

        manager.signalSub = null;
        manager.connection = null;
        manager.hubStarted = false;

        const hub = hubs.get(sub.signalName);
        if (!hub) return;

        hub.subs.delete(sub);
        if (hub.subs.size > 0) return;

        const shutdown = async () => {
            if (hub.subs.size > 0) return;
            hub.disposed = true;
            if (hubs.get(sub.signalName) === hub) hubs.delete(sub.signalName);
            try {
                await hub.connection.stop();
                console.log("SignalR desconectado");
            } catch (err) {
                console.error("Error al desconectar SignalR:", err);
            }
        };

        if (immediate) {
            clearTimeout(hub.stopTimer);
            await shutdown();
        } else {
            hub.stopTimer = setTimeout(shutdown, STOP_GRACE_MS);
        }
    }
}

/**
 * Agrupa ráfagas (debounce) y evita ejecuciones solapadas (single-flight).
 * `fn` debe devolver la promesa (return/await) para que el single-flight funcione.
 * Si llegan disparos mientras corre, se hace UNA ejecución más al terminar.
 */
export function coalesce(fn, wait = 300) {
    let timer = null;
    let running = false;
    let dirty = false;

    const trigger = () => {
        clearTimeout(timer);
        timer = setTimeout(run, wait);
    };

    async function run() {
        if (running) {
            dirty = true;
            return;
        }
        running = true;
        try {
            await fn();
        } catch (e) {
            console.error("coalesce:", e);
        } finally {
            running = false;
            if (dirty) {
                dirty = false;
                trigger();
            }
        }
    }

    return trigger;
}