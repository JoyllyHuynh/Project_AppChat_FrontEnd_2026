import { clearSession, configure, disconnect, reLogin, request, setSession } from '../../../services/api/socketClient';
import { tokenStorage } from '../../../services/api/tokenStorage';

const PROFILE_KEY = (username) => `webchat.profile.${username}`;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const readProfile = (username) => {
    try {
        return JSON.parse(localStorage.getItem(PROFILE_KEY(username))) || {};
    } catch {
        return {};
    }
};
const writeProfile = (username, patch) => {
    try {
        localStorage.setItem(PROFILE_KEY(username), JSON.stringify({ ...readProfile(username), ...patch }));
    } catch {
        throw new Error('Storage is full. Try a smaller avatar image.');
    }
};
const buildUser = (username) => ({
    id: username,
    username,
    fullName: username,
    email: '',
    phone: '',
    bio: '',
    avatar: null,
    status: 'online',
    ...readProfile(username),
});

let expiredCallback = null;
configure({
    onSessionCode: (code) => tokenStorage.updateToken(code),
    onSessionExpired: () => {
        tokenStorage.clear();
        expiredCallback?.();
    },
});

export const onSessionExpired = (callback) => {
    expiredCallback = callback;
};

export const getSession = () => {
    const username = tokenStorage.getToken() ? tokenStorage.getUser()?.username : null;
    return username ? buildUser(username) : null;
};

export const login = async ({ username, password, remember }) => {
    const data = await request('LOGIN', { user: username, pass: password });
    tokenStorage.save({ token: data.RE_LOGIN_CODE, user: { username } }, remember);
    setSession({ user: username, code: data.RE_LOGIN_CODE });
    writeProfile(username, { status: 'online' });
    return buildUser(username);
};

export const register = async ({ username, password }) => {
    await request('REGISTER', { user: username, pass: password });
    return login({ username, password, remember: true });
};

export const logout = async () => {
    try {
        await request('LOGOUT');
    } catch {

    }
    clearSession();
    tokenStorage.clear();
    disconnect();
    return true;
};

export const restoreSession = async () => {
    const username = tokenStorage.getUser()?.username;
    const code = tokenStorage.getToken();
    if (!username || !code) return null;
    setSession({ user: username, code });
    try {
        await reLogin();
    } catch (err) {
        if (err.server) throw err;
    }
    return buildUser(username);
};

export const forgotPassword = async () => {
    await delay(900);
    return true;
};

export const updateProfile = async (_id, patch) => {
    const { id, username, ...rest } = patch;
    writeProfile(tokenStorage.getUser().username, rest);
    return buildUser(tokenStorage.getUser().username);
};

export const setStatus = async (_id, status) => {
    const username = tokenStorage.getUser().username;
    writeProfile(username, { status });
    return buildUser(username);
};

export const changePassword = async () => {
    throw new Error('Changing the password is not supported by the server yet.');
};