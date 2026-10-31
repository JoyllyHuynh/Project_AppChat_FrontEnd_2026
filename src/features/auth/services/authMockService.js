const USERS_KEY = 'webchat.users';
const SESSION_KEY = 'webchat.session';
const delay = (ms = 700) => new Promise((r) => setTimeout(r, ms));

const read = (k, fallback) => {
    try {
        return JSON.parse(localStorage.getItem(k)) ?? fallback;
    } catch {
        return fallback;
    }
};
const write = (k, v) => {
    try {
        localStorage.setItem(k, JSON.stringify(v));
    } catch {
        throw new Error('Storage is full. Try a smaller avatar image.');
    }
};

const DEMO_USER = {
    id: 'u_demo',
    fullName: 'Ma Nguyen Vu',
    username: 'manguyenvu',
    email: 'demo@webchat.com',
    password: '123456',
    phone: '',
    bio: 'Building WebChat.',
    avatar: null,
    status: 'online',
};

const getUsers = () => {
    const users = read(USERS_KEY, null);
    if (users) return users;
    write(USERS_KEY, [DEMO_USER]);
    return [DEMO_USER];
};
const strip = ({ password, ...rest }) => rest;

export const getSession = () => {
    const id = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    const user = getUsers().find((u) => u.id === id);
    return user ? strip(user) : null;
};

export const login = async ({ email, password, remember }) => {
    await delay();
    const user = getUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
    if (!user) throw new Error('Incorrect email or password.');
    (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, user.id);
    return { ...strip(user), status: 'online' };
};

export const register = async ({ fullName, email, password }) => {
    await delay();
    const users = getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
        throw new Error('This email is already registered.');
    }
    const user = {
        id: `u_${Date.now()}`,
        fullName: fullName.trim(),
        username: email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20) || 'user',
        email: email.trim(),
        password,
        phone: '',
        bio: '',
        avatar: null,
        status: 'online',
    };
    write(USERS_KEY, [...users, user]);
    localStorage.setItem(SESSION_KEY, user.id);
    return strip(user);
};

export const logout = async () => {
    await delay(250);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    return true;
};

export const forgotPassword = async () => {
    await delay(900);
    return true;
};

const updateUser = (id, patch) => {
    const users = getUsers().map((u) => (u.id === id ? { ...u, ...patch } : u));
    write(USERS_KEY, users);
    return strip(users.find((u) => u.id === id));
};

export const updateProfile = async (id, patch) => {
    await delay(500);
    return updateUser(id, patch);
};

export const setStatus = async (id, status) => updateUser(id, { status });

export const changePassword = async (id, { currentPassword, newPassword }) => {
    await delay();
    const user = getUsers().find((u) => u.id === id);
    if (!user || user.password !== currentPassword) throw new Error('Current password is incorrect.');
    updateUser(id, { password: newPassword });
    return true;
};