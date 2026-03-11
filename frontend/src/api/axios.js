import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const isAuthEndpoint =
        typeof config.url === 'string' &&
        (config.url.includes('/auth/login') || config.url.includes('/auth/register'));

    if (token && !isAuthEndpoint) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;