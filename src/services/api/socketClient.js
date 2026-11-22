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
let requestSeq = 0;
const NO_AUTH_EVENTS = ["REGISTER", "LOGIN", "RE_LOGIN"];
const RESPONSE_EVENT_MAP = {
    CHAT_CHECK_USER_ONLINE: "CHECK_USER_ONLINE",
    CHAT_CHECK_USER_EXIST: "CHECK_USER_EXIST",
};
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
    const queue = (pending.get(event) || []).filter(
        (e) => e !== entry
    );

    if (queue.length === 0) {
        pending.delete(event);
    } else {
        pending.set(event, queue);
    }
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

function rejectOldestAuthRequest(mes) {
    let oldest = null;
    pending.forEach((queue, event) => {
        if (NO_AUTH_EVENTS.includes(event)) return;
        queue.forEach((entry) => {
            if (!oldest || entry.seq < oldest.entry.seq) oldest = { event, entry };
        });
    });
    if (!oldest) return false;

    removePending(oldest.event, oldest.entry);
    clearTimeout(oldest.entry.timer);
    const error = new Error(mes || "User not Login");
    error.server = true;
    error.authRequired = true;
    oldest.entry.reject(error);
    return true;
}

function rejectOldestPendingRequest(message, errorCode) {
    let oldest = null;

    pending.forEach((queue, event) => {
        queue.forEach((entry) => {
            if (!oldest || entry.seq < oldest.entry.seq) {
                oldest = { event, entry };
            }
        });
    });

    if (!oldest) return false;

    removePending(oldest.event, oldest.entry);
    clearTimeout(oldest.entry.timer);

    const error = new Error(message || "Server rejected the request.");
    error.server = true;
    error.code = errorCode;
    error.requestEvent = oldest.event;

    oldest.entry.reject(error);

    return true;
}

function handleMessage(message) {
    let packet;

    try {
        packet = JSON.parse(message.data);
    } catch {
        return;
    }

    if (packet.event === "AUTH" && packet.status === "error") {
        rejectOldestAuthRequest(packet.mes);
        listeners.get("AUTH")?.forEach((fn) => fn(packet));
        return;
    }

    if (
        packet.event === "ACTION_NOT_EXIT" &&
        packet.status === "error"
    ) {
        rejectOldestPendingRequest(
            packet.mes || "Server does not recognize this event.",
            packet.event
        );

        listeners.get(packet.event)?.forEach((fn) => fn(packet));
        return;
    }

    const mappedRequestEvent =
        Object.keys(RESPONSE_EVENT_MAP).find(
            (event) => RESPONSE_EVENT_MAP[event] === packet.event
        );

    const requestEvent = pending.has(packet.event)
        ? packet.event
        : mappedRequestEvent || packet.event;

    const waiting = pending.get(requestEvent);

    if (waiting && waiting.length > 0) {
        const entry = waiting.shift();

        if (waiting.length === 0) {
            pending.delete(requestEvent);
        }

        clearTimeout(entry.timer);

        if (packet.status === "success") {
            entry.resolve(packet.data);
        } else {
            const error = new Error(packet.mes || "Request failed.");
            error.server = true;
            error.code = packet.event;

            entry.reject(error);
        }

        return;
    }

    listeners.get(packet.event)?.forEach((fn) => fn(packet));
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
        const entry = { resolve, reject, timer: null, seq: (requestSeq += 1) };
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