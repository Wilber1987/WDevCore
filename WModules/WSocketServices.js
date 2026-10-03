// WSocketServices.js
// Una sola conexión SignalR por hub, compartida por todos los componentes.
// Misma firma pública que la versión anterior: InitSignalR / StopSignalR / coalesce.
// Mejoras: dedup de señales duplicadas, supresión de eco propio,
// limpieza de suscriptores zombis y registro global anti-duplicado de módulo.

// 🌐 Registro GLOBAL: si este módulo se carga dos veces en el bundle,
// ambas instancias comparten los mismos hubs => una sola conexión real.
const hubs = (window.__wsHubs ??= new Map()); // signalName -> hub

const RETRY_DELAYS = [0, 2000, 5000, 10000, 30000]; // ms; el último se repite
const STOP_GRACE_MS = 5000;   // espera antes de cerrar un hub sin suscriptores
const DEDUP_WINDOW_MS = 1500; // ventana para descartar señales idénticas repetidas

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const delayFor = (attempt) => {
    const base = RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)];
    return base ? base + Math.random() * 1000 : 0; // jitter anti-manada
};

// ---------------- Estado de supresión de eco ----------------
let currentUserId = null;                    // se setea con WSocketServices.setIdentity()
const selfUpdateMarks = new Map();           // caseId(string) -> timestamp del update propio
const recentSignals = new Map();             // key -> timestamp (dedup de frames duplicados)
let DEBUG = false;

const log = (...args) => { if (DEBUG) console.log("[WSocket]", ...args); };

/** Clave estable para detectar la MISMA señal llegando dos veces. */
function signalKey(m) {
    if (m == null || typeof m !== "object") return `v:${m}`;
    if (m.EventId != null) return `ev:${m.EventId}`;
    const id = m.Id_Case ?? m.CaseId ?? m.Id_conversacion ?? m.Id_mensaje ?? "";
    const stamp = m.Timestamp ?? m.UpdateDate ?? m.Fecha ?? "";
    if (id !== "" || stamp !== "") return `id:${id}|${stamp}`;
    try {
        const s = JSON.stringify(m);
        return s.length > 4096 ? `big:${s.length}:${s.slice(0, 256)}` : `js:${s}`;
    } catch {
        return `rnd:${Math.random()}`; // no deduplicable
    }
}

function pruneRecentSignals(now) {
    if (recentSignals.size <= 500) return;
    for (const [k, ts] of recentSignals) {
        if (now - ts > DEDUP_WINDOW_MS) recentSignals.delete(k);
    }
}

function defaultOwner(manager) {
    // Si el manager es un elemento (web component), lo usamos como dueño vivo
    if (manager && typeof manager.isConnected === "boolean") return manager;
    return manager?.ownerElement ?? null;
}

function createHub(signalName, options) {
    // @ts-ignore
    const { HubConnectionBuilder, HttpTransportType, LogLevel } = window.signalR;

    const urlOptions = {
        accessTokenFactory: () => localStorage.getItem("token") || null
    };

    if (options.webSocketsOnly) {
        urlOptions.skipNegotiation = true;
        urlOptions.transport = HttpTransportType.WebSockets;
    }

    const connection = new HubConnectionBuilder()
        .withUrl("/" + signalName, urlOptions)
        .withAutomaticReconnect({
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
        // 🛡️ DEDUP: si la misma señal ya llegó hace <1.5s (2 sockets o doble envío), se descarta
        const now = Date.now();
        const key = signalKey(mensaje);
        const prev = recentSignals.get(key);
        recentSignals.set(key, now);
        pruneRecentSignals(now);

        if (prev != null && now - prev < DEDUP_WINDOW_MS) {
            log("señal duplicada ignorada:", key);
            return;
        }
        log("señal recibida:", key, "subs:", hub.subs.size);
        dispatch(hub, mensaje);
    });

    connection.on("Error", (error) => {
        console.error("Error SignalR:", error);
    });

    connection.onreconnecting((err) => {
        console.warn("SignalR reconectando…", err?.message);
    });

    connection.onreconnected(() => {
        log("reconectado, connectionId:", connection.connectionId);
        hub.subs.forEach((sub) => {
            try { sub.onReconnected?.(); } catch (e) { console.error("Error en onReconnected:", e); }
        });
    });

    connection.onclose((err) => {
        if (hub.disposed) return;
        console.warn("SignalR cerrado inesperadamente", err?.message);
        setTimeout(() => ensureStarted(hub), 5000);
    });

    return hub;
}

/** Despacha a los suscriptores con supresión de eco y limpieza de zombis. */
function dispatch(hub, mensaje) {
    const origin = mensaje?.OriginUserId ?? mensaje?.originUserId ?? null;
    const caseId = mensaje?.CaseId ?? mensaje?.Id_Case;

    for (const sub of [...hub.subs]) {
        // 🧟 Auto-limpieza: componente desmontado sin llamar StopSignalR
        if (sub.ownerElement && sub.ownerElement.isConnected === false) {
            hub.subs.delete(sub);
            log("sub zombi eliminado");
            continue;
        }
        if (!sub.action) continue;

        // 🙉 Eco a nivel usuario: el servidor marcó el payload como mío
        if (origin != null && currentUserId != null &&
            String(origin) === String(currentUserId) && !sub.receiveOwn) {
            log("eco propio ignorado (OriginUserId)");
            continue;
        }

        // 🙉 Eco por ventana: este manager acaba de actualizar ese caso él mismo
        if (caseId != null && sub.echoWindowMs > 0) {
            const ts = selfUpdateMarks.get(String(caseId));
            if (ts && Date.now() - ts < sub.echoWindowMs) {
                log("eco propio ignorado (ventana self-update)");
                continue;
            }
        }

        try {
            sub.action(mensaje);
        } catch (e) {
            console.error("Error en handler de ReadSignal:", e);
        }
    }
}

async function startWithRetry(hub) {
    let attempt = 0;
    while (!hub.disposed) {
        const state = hub.connection.state;
        if (state === "Connected") return;

        if (state === "Disconnected") {
            try {
                await hub.connection.start();
                log("conectado, connectionId:", hub.connection.connectionId);
                return;
            } catch (err) {
                console.error("Error al conectar SignalR:", err);
                await sleep(delayFor(++attempt));
                continue;
            }
        }
        await sleep(500); // Connecting/Reconnecting/Disconnecting: espera a SignalR
    }
}

function ensureStarted(hub) {
    if (hub.disposed) return Promise.resolve();
    if (!hub.startPromise) {
        hub.startPromise = startWithRetry(hub).finally(() => { hub.startPromise = null; });
    }
    return hub.startPromise;
}

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

    /** Identidad del usuario actual (para supresión de eco por OriginUserId). Llamar al login. */
    static setIdentity(userId) {
        currentUserId = userId == null ? null : String(userId);
    }

    /** Marcar que YO acabo de actualizar este caso (habilita la ventana de eco por manager). */
    static markSelfUpdate(caseId) {
        selfUpdateMarks.set(String(caseId), Date.now());
        if (selfUpdateMarks.size > 200) {
            const oldest = selfUpdateMarks.keys().next().value;
            selfUpdateMarks.delete(oldest);
        }
    }

    static set debug(v) { DEBUG = !!v; }
    static get debug() { return DEBUG; }

    /** Foto del estado actual: útil para verificar en consola sockets/subs. */
    static diagnostics() {
        return [...hubs.values()].map((h) => ({
            hub: h.name,
            state: h.connection.state,
            connectionId: h.connection.connectionId,
            subs: h.subs.size
        }));
    }

    /**
     * @param {any} manager  objeto que contendrá connection / hubStarted / signalSub
     * @param {(mensaje:any)=>void} action  se ejecuta con cada ReadSignal no suprimido
     * @param {string} signalName  nombre del hub
     * @param {{ onReconnected?: ()=>void, webSocketsOnly?: boolean,
     *           receiveOwn?: boolean, echoWindowMs?: number, ownerElement?: any }} options
     */
    static async InitSignalR(manager, action, signalName = "chatHub", options = {}) {
        // @ts-ignore
        if (!window.signalR) {
            console.error("signalR no está cargado");
            return;
        }

        // ✅ Si este manager YA está suscrito, refrescamos su closure en vez de ignorarlo
        // (evita handlers viejos tras re-renders, sin crear subs duplicados)
        if (manager.signalSub) {
            const sub = manager.signalSub;
            sub.action = action;
            sub.onReconnected = options.onReconnected ?? sub.onReconnected;
            sub.receiveOwn = options.receiveOwn ?? sub.receiveOwn;
            sub.echoWindowMs = options.echoWindowMs ?? sub.echoWindowMs;
            sub.ownerElement = options.ownerElement ?? sub.ownerElement;
            const hub = hubs.get(sub.signalName);
            if (hub) {
                clearTimeout(hub.stopTimer);
                hub.stopTimer = null;
                await ensureStarted(hub);
                manager.hubStarted = hub.connection.state === "Connected";
            }
            return;
        }

        let hub = hubs.get(signalName);
        if (!hub) {
            hub = createHub(signalName, options);
            hubs.set(signalName, hub);
        }

        clearTimeout(hub.stopTimer);
        hub.stopTimer = null;

        const sub = {
            signalName,
            action,
            onReconnected: options.onReconnected,
            receiveOwn: options.receiveOwn ?? false,
            echoWindowMs: options.echoWindowMs ?? 0,
            ownerElement: options.ownerElement ?? defaultOwner(manager)
        };
        hub.subs.add(sub);

        manager.signalSub = sub;          // antes del await: sin race condition
        manager.connection = hub.connection;

        await ensureStarted(hub);

        if (manager.signalSub === sub) {
            manager.hubStarted = hub.connection.state === "Connected";
        }
    }

    /**
     * Desuscribe al manager. La conexión solo se cierra si nadie más la usa
     * y tras el período de gracia.
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
                log("desconectado");
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
 * Sin cambios de contrato: `fn` debe devolver la promesa.
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
        if (running) { dirty = true; return; }
        running = true;
        try {
            await fn();
        } catch (e) {
            console.error("coalesce:", e);
        } finally {
            running = false;
            if (dirty) { dirty = false; trigger(); }
        }
    }

    return trigger;
}