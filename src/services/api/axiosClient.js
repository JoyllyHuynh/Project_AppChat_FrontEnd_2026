import axios from 'axios';
import { tokenStorage } from './tokenStorage';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config) => {
    const token = tokenStorage.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isCancel(error)) return Promise.reject(error);
        const message =
            error.response?.data?.message ||
            (error.request ? 'Cannot reach the server. Check your connection.' : error.message);
        return Promise.reject(new Error(message));
    }
);

export default axiosClient;