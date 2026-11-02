import axiosClient from '../../../services/api/axiosClient';
import { tokenStorage } from '../../../services/api/tokenStorage';

const ENDPOINTS = {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    profile: '/users/me',
    status: '/users/me/status',
    changePassword: '/auth/change-password',
};

export const getSession = () => (tokenStorage.getToken() ? tokenStorage.getUser() : null);

export const login = async ({ email, password, remember }) => {
    const { data } = await axiosClient.post(ENDPOINTS.login, { email, password });
    tokenStorage.save({ token: data.token, user: data.user }, remember);
    return data.user;
};

export const register = async ({ fullName, email, password }) => {
    const { data } = await axiosClient.post(ENDPOINTS.register, { fullName, email, password });
    tokenStorage.save({ token: data.token, user: data.user }, true);
    return data.user;
};

export const logout = async () => {
    try {
        await axiosClient.post(ENDPOINTS.logout);
    } catch {

    }
    tokenStorage.clear();
    return true;
};

export const forgotPassword = async ({ email }) => {
    await axiosClient.post(ENDPOINTS.forgotPassword, { email });
    return true;
};

export const updateProfile = async (_userId, patch) => {
    const { data } = await axiosClient.patch(ENDPOINTS.profile, patch);
    tokenStorage.updateUser(data);
    return data;
};

export const setStatus = async (_userId, status) => {
    const { data } = await axiosClient.patch(ENDPOINTS.status, { status });
    tokenStorage.updateUser(data);
    return data;
};

export const changePassword = async (_userId, { currentPassword, newPassword }) => {
    await axiosClient.post(ENDPOINTS.changePassword, { currentPassword, newPassword });
    return true;
};