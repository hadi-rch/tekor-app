import axios from 'axios';
import API_URL from '../src/constants/api';
import { getAccessToken, getRefreshToken, saveTokens, deleteTokens } from '../utils/authStorage';
import { store } from '../src/store/store';
import { logout } from '../src/store/authSlice';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Request Interceptor ---
// Berjalan SEBELUM setiap request dikirim
api.interceptors.request.use(
    async (config) => {
        const accessToken = await getAccessToken();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Response Interceptor ---
// Berjalan SETELAH response diterima
api.interceptors.response.use(
    // Jika response sukses (status 2xx), langsung kembalikan
    (response) => {
        return response;
    },
    // Jika response gagal (status 4xx atau 5xx)
    async (error) => {
        const originalRequest = error.config;

        // Cek jika error adalah 401 (Unauthorized) dan request ini belum pernah dicoba ulang
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Tandai bahwa kita akan mencoba ulang request ini

            try {
                const refreshToken = await getRefreshToken();
                if (!refreshToken) {
                    // Jika tidak ada refresh token, langsung logout
                    store.dispatch(logout());
                    return Promise.reject(error);
                }

                // Panggil endpoint refresh token di backend Anda
                const rs = await api.post('/api/v1/auth/refresh-token', { refreshToken });

                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = rs.data.data.token;

                // Simpan token-token yang baru
                await saveTokens(newAccessToken, newRefreshToken);

                // Perbarui header default axios untuk request selanjutnya
                api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

                // Perbarui header untuk request yang gagal tadi
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                // Coba ulang request yang gagal tadi dengan token baru
                return api(originalRequest);

            } catch (_error) {
                // Jika refresh token juga gagal, logout pengguna
                store.dispatch(logout());
                return Promise.reject(_error);
            }
        }

        // Untuk error lain (selain 401), langsung kembalikan errornya
        return Promise.reject(error);
    }
);


export default api;
