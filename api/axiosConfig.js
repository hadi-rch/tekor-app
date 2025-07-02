import axios from 'axios';
// Pastikan file ini ada dan berisi IP address backend Anda
import API_URL from '../src/constants/api';

// Membuat instance axios dengan konfigurasi default
const api = axios.create({
    baseURL: API_URL, // URL dasar untuk semua request
    headers: {
        'Content-Type': 'application/json',
    },
});

/*
        Di masa depan, Anda bisa menambahkan 'interceptor' di sini.
        Interceptor adalah kode yang akan berjalan secara otomatis pada SETIAP request
        atau response. Sangat berguna untuk:

        1. Request Interceptor:
        - Mengambil token dari SecureStore.
        - Menambahkan token tersebut ke header Authorization secara otomatis
        sebelum request dikirim.

        2. Response Interceptor:
        - Menangani error secara global (misalnya, jika token kedaluwarsa,
        otomatis logout pengguna).
*/

export default api;
