import { webSocketClient } from "../../../services/api/websocketClient";

const SESSION_KEY = "webchat.socketSession";

const saveSession = (username, code, remember) => {
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;

  otherStorage.removeItem(SESSION_KEY);

  storage.setItem(
    SESSION_KEY,
    JSON.stringify({ username, code })
  );
};

export const getSession = () => {
  try {
    const value =
      sessionStorage.getItem(SESSION_KEY) ||
      localStorage.getItem(SESSION_KEY);

    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
};

const waitForEvent = (expectedEvent, timeout = 10000) => {
  return new Promise((resolve, reject) => {
    let unsubscribe;

    const timer = setTimeout(() => {
      unsubscribe?.();
      reject(new Error(`Server không phản hồi event ${expectedEvent}`));
    }, timeout);

    unsubscribe = webSocketClient.onMessage((message) => {
      if (message?.event !== expectedEvent) return;

      clearTimeout(timer);
      unsubscribe();

      if (message.status !== "success") {
        reject(new Error("Đăng nhập thất bại. Vui lòng kiểm tra tài khoản."));
        return;
      }

      resolve(message);
    });
  });
};

const request = async (event, data) => {
  const responsePromise = waitForEvent(event);

  try {
    webSocketClient.send(event, data);
  } catch (error) {
    throw error;
  }

  return responsePromise;
};

export const login = async ({ username, password, remember }) => {
  await webSocketClient.connect();

  const response = await request("LOGIN", {
    user: username.trim(),
    pass: password,
  });

  const code = response.data?.RE_LOGIN_CODE;

  if (!code) {
    throw new Error("Server không trả về mã đăng nhập.");
  }

  saveSession(username.trim(), code, remember);

  return {
    id: username.trim(),
    username: username.trim(),
    fullName: username.trim(),
    status: "online",
  };
};

export const reLogin = async () => {
  const session = getSession();

  if (!session?.username || !session?.code) {
    return null;
  }

  await webSocketClient.connect();

  const response = await request("RE_LOGIN", {
    user: session.username,
    code: session.code,
  });

  const newCode = response.data?.RE_LOGIN_CODE;

  if (!newCode) {
    throw new Error("Server không trả về mã đăng nhập lại.");
  }

const remember = localStorage.getItem(SESSION_KEY) !== null;
saveSession(session.username, newCode, remember);

  return {
    id: session.username,
    username: session.username,
    fullName: session.username,
    status: "online",
  };
};

export const logout = async () => {
  clearSession();
  webSocketClient.disconnect();
  return true;
};