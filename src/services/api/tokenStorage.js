const TOKEN_KEY = 'webchat.token';
const USER_KEY = 'webchat.user';

const stores = () => [localStorage, sessionStorage];
const read = (key) => {
    for (const store of stores()) {
        const value = store.getItem(key);
        if (value) return value;
    }
    return null;
};
const currentStore = () => stores().find((s) => s.getItem(TOKEN_KEY)) || localStorage;

export const tokenStorage = {
    save({ token, user }, remember = true) {
        this.clear();
        const store = remember ? localStorage : sessionStorage;
        store.setItem(TOKEN_KEY, token);
        store.setItem(USER_KEY, JSON.stringify(user));
    },
    getToken: () => read(TOKEN_KEY),
    getUser() {
        try {
            return JSON.parse(read(USER_KEY));
        } catch {
            return null;
        }
    },
    updateUser(user) {
        currentStore().setItem(USER_KEY, JSON.stringify(user));
    },
    clear() {
        stores().forEach((s) => {
            s.removeItem(TOKEN_KEY);
            s.removeItem(USER_KEY);
        });
    },
};