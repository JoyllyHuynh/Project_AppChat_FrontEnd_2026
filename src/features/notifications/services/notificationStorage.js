const PREFIX = "webchat.notifications.";
const MAX_ITEMS = 100;

export const loadNotifications = (username) => {
    try {
        const raw = localStorage.getItem(PREFIX + username);
        if (raw === null) return null;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : null;
    } catch {
        return null;
    }
};

export const saveNotifications = (username, items) => {
    try {
        localStorage.setItem(PREFIX + username, JSON.stringify(items.slice(0, MAX_ITEMS)));
    } catch {

    }
};