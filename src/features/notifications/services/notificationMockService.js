import { mockNotifications } from '../../../services/mock/notificationData';

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

let db = mockNotifications.map((n) => ({ ...n }));

export const fetchNotifications = async () => {
    await delay();
    return db.map((n) => ({ ...n }));
};

export const markAsRead = async (id) => {
    await delay(150);
    db = db.map((n) => (n.id === id ? { ...n, read: true } : n));
    return id;
};

export const markAllAsRead = async () => {
    await delay(150);
    db = db.map((n) => ({ ...n, read: true }));
    return true;
};