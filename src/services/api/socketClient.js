const WS_URL = import.meta.env.VITE_WS_URL || 'wss://chat.longapp.io.vn/chat/chat';
const REQUEST_TIMEOUT = 10000;
const MAX_BACKOFF = 15000;

let socket = null;
let connecting = null;
let manualClose = false;
let retry = 0;
let reconnectTimer = null;
let session = null;
const hooks = { onSessionCode: null, onSessionExpired: null };
const pending = new Map();
const listeners = new Map();

const isOpen = () => socket && socket.readyState === WebSocket.OPEN;
const buildPacket = (event, data) => ({ action: 'onchat', data: data === undefined ? { event } : { event, data } });

export const configure = (newHooks) => Object.assign(hooks, newHooks);
export const setSession = (value) => {
    session = value;
};
export const clearSession = () => {
    session = null;
};

function removePending(event, entry) {
    pending.set(event, (pending.get(event) || []).filter((e) => e !== entry));
}

function failAllPending(error) {
    pending.forEach((queue) =>
        queue.forEach((entry) => {
            clearTimeout(entry.timer);
            entry.reject(error);
        })
    );
    pending.clear();
}

function handleMessage(message) {
    let packet;

    try {
        packet = JSON.parse(message.data);
    } catch (error) {
        console.error("[WebSocket] Invalid message:", error);
        return;
    }

    console.log("[WebSocket] Received event:", packet.event);

    if (packet.event === "GET_ROOM_CHAT_MES") {
        console.log(
            "[GET_ROOM_CHAT_MES] Full server packet:",
            JSON.stringify(packet, null, 2)
        );
    }

    const waiting = pending.get(packet.event);
    let responseIndex = 0;

    if (packet.event === "SEND_CHAT" && packet.data?.name) {
        responseIndex = waiting?.findIndex(
            (entry) =>
                packet.data.name === session?.user &&
                packet.data.to === entry.data?.to &&
                packet.data.mes === entry.data?.mes
        ) ?? -1;
    }

    if (waiting && responseIndex !== -1 && waiting.length > 0) {
        const [entry] = waiting.splice(responseIndex, 1);

        clearTimeout(entry.timer);

        if (packet.status === "success") {
            entry.resolve(packet.data);
        } else {
            const error = new Error(
                packet.mes || "Request failed."
            );

            error.server = true;
            entry.reject(error);
        }
    }
    listeners.get(packet.event)?.forEach((fn) => {
        try {
            fn(packet);
        } catch (error) {
            console.error(
                `[WebSocket] Listener ${packet.event} failed:`,
                error
            );
        }
    });
}


export function connect() {
    if (isOpen()) return Promise.resolve();
    if (connecting) return connecting;
    manualClose = false;
    connecting = new Promise((resolve, reject) => {
        const ws = new WebSocket(WS_URL);
        socket = ws;
        ws.onopen = () => {
            retry = 0;
            connecting = null;
            resolve();
        };
        ws.onmessage = handleMessage;
        ws.onclose = () => {
            reject(new Error('Cannot connect to the chat server.'));
            if (socket !== ws) return;
            socket = null;
            connecting = null;
            failAllPending(new Error('Connection lost.'));
            if (!manualClose && session) scheduleReconnect();
        };
    });
    return connecting;
}

export function disconnect() {
    manualClose = true;
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
    const ws = socket;
    socket = null;
    connecting = null;
    failAllPending(new Error('Disconnected.'));
    ws?.close();
}

export async function request(event, data) {
    await connect();
    return new Promise((resolve, reject) => {
        const entry = { resolve, reject, timer: null, data };
        entry.timer = setTimeout(() => {
            removePending(event, entry);
            reject(new Error('The server did not respond. Try again.'));
        }, REQUEST_TIMEOUT);
        pending.set(event, [...(pending.get(event) || []), entry]);
        try {
            socket.send(JSON.stringify(buildPacket(event, data)));
        } catch (err) {
            clearTimeout(entry.timer);
            removePending(event, entry);
            reject(err);
        }
    });
}

export async function send(event, data) {
    await connect();
    socket.send(JSON.stringify(buildPacket(event, data)));
}

export function on(event, handler) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(handler);
    return () => listeners.get(event)?.delete(handler);
}

export async function reLogin() {
    if (!session) throw new Error('No session to restore.');
    try {
        const data = await request('RE_LOGIN', { user: session.user, code: session.code });
        session = { ...session, code: data.RE_LOGIN_CODE };
        hooks.onSessionCode?.(session.code);
    } catch (err) {
        if (err.server) {
            session = null;
            hooks.onSessionExpired?.(err);
        }
        throw err;
    }
}

function scheduleReconnect() {
    if (reconnectTimer) return;
    const delay = Math.min(1000 * 2 ** retry, MAX_BACKOFF);
    retry += 1;
    reconnectTimer = setTimeout(async () => {
        reconnectTimer = null;
        try {
            await connect();
            await reLogin();
        } catch (err) {
            if (!err.server && socket) socket.close();
        }
    }, delay);
}