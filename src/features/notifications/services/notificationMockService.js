import { mockNotifications } from "../../../services/mock/notificationData";
import { loadNotifications, saveNotifications } from "./notificationStorage";
import { mergeMessageNotification } from "./messageNotification";

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const SEED_SAMPLES = import.meta.env.VITE_API_MODE !== "socket";

export const fetchNotifications = async ({ username }) => {
    await delay();

    const stored = loadNotifications(username);
    if (stored) return stored;

    const initial = SEED_SAMPLES ? mockNotifications.map((n) => ({ ...n })) : [];
    saveNotifications(username, initial);
    return initial;
};

export const addNotification = async (notification, { username }) => {
    const items = loadNotifications(username) || [];
    const { items: next, notification: saved } = mergeMessageNotification(items, notification);
    saveNotifications(username, next);
    return saved;
};

export const markAsRead = async (id, { username }) => {
    await delay(150);
    const items = (loadNotifications(username) || []).map((n) =>
        n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(username, items);
    return id;
};

export const markAllAsRead = async ({ username }) => {
    await delay(150);
    const items = (loadNotifications(username) || []).map((n) => ({ ...n, read: true }));
    saveNotifications(username, items);
    return true;
};