const WEBSOCKET_URL = "wss://chat.longapp.io.vn/chat/chat";

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Set();
    this.connectPromise = null;
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

connect() {
  if (this.isConnected()) {
    return Promise.resolve();
  }

  if (this.connectPromise) {
    return this.connectPromise;
  }

  this.connectPromise = new Promise((resolve, reject) => {
    const socket = new WebSocket(WEBSOCKET_URL);

    this.socket = socket;

    let settled = false;

    socket.onopen = () => {
      settled = true;
      console.log("[WebSocket] Connected successfully");
      resolve();
    };

    socket.onmessage = (event) => {
      let message;

      try {
        message = JSON.parse(event.data);
      } catch {
        message = { raw: event.data };
      }

      this.listeners.forEach((listener) => {
        listener(message);
      });
    };

    socket.onerror = () => {
      console.error("[WebSocket] Connection error");

      if (!settled) {
        settled = true;
        reject(new Error("Không thể kết nối đến WebSocket Server"));
      }
    };

    socket.onclose = () => {
      console.log("[WebSocket] Connection closed");

      if (!settled) {
        settled = true;
        reject(new Error("WebSocket đã đóng trước khi kết nối thành công"));
      }

      if (this.socket === socket) {
        this.socket = null;
      }

      this.connectPromise = null;
    };
  });

  return this.connectPromise;
}

  send(event, data = {}) {
    if (!this.isConnected()) {
      throw new Error("WebSocket chưa được kết nối");
    }

    const payload = {
      action: "onchat",
      data: {
        event,
        data,
      },
    };

    this.socket.send(JSON.stringify(payload));

    console.log(`[WebSocket] Sent event: ${event}`, payload);
  }

  onMessage(listener) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.connectPromise = null;
    }

    this.listeners.clear();
  }
}

export const webSocketClient = new WebSocketClient();