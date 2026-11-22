import { DEFAULT_SETTINGS } from "../settingsConfig";

const PREFIX = "webchat.settings.";

const sanitize = (raw) => {
    const clean = {};
    if (!raw || typeof raw !== "object") return clean;

    Object.keys(DEFAULT_SETTINGS).forEach((key) => {
        if (typeof raw[key] === "boolean") clean[key] = raw[key];
    });
    return clean;
};

export const loadAllSettings = () => {
    const result = {};

    for (let i = 0; i < localStorage.length; i += 1) {
        const storageKey = localStorage.key(i);
        if (!storageKey || !storageKey.startsWith(PREFIX)) continue;

        try {
            const username = storageKey.slice(PREFIX.length);
            result[username] = sanitize(JSON.parse(localStorage.getItem(storageKey)));
        } catch {

        }
    }
    return result;
};

export const saveSettings = (username, values) => {
    try {
        localStorage.setItem(PREFIX + username, JSON.stringify(sanitize(values)));
    } catch {

    }
};

export const removeSettings = (username) => {
    try {
        localStorage.removeItem(PREFIX + username);
    } catch {

    }
};