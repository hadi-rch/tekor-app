import api from '../../api/axiosConfig'; // Impor instance axios
import { getAccessToken, getRefreshToken, saveTokens, deleteTokens } from '../../utils/authStorage';
import { logout } from '../store/authSlice';

const setupInterceptors = (store) => { // Terima 'store' sebagai argumen
    // Setup Request Interceptor
    api.interceptors.request.use(
        async (config) => {
            const accessToken = await getAccessToken();
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Setup Response Interceptor
    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const refreshToken = await getRefreshToken();
                    if (!refreshToken) {
                        store.dispatch(logout());
                        return Promise.reject(error);
                    }
                    const rs = await api.post('/api/v1/auth/refresh-token', { refreshToken });
                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = rs.data.data.token;
                    await saveTokens(newAccessToken, newRefreshToken);
                    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } catch (_error) {
                    store.dispatch(logout());
                    return Promise.reject(_error);
                }
            }
            return Promise.reject(error);
        }
    );
};

export default setupInterceptors;