import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// Menggunakan alias 'SecureStore' untuk konsistensi
import * as SecureStore from 'expo-secure-store';
// Menggunakan helper untuk menyimpan dan menghapus token
import { saveTokens, deleteTokens } from '../../utils/authStorage';
import api from '../../api/axiosConfig';


// --- Async Thunk untuk Login ---
// Ini adalah fungsi yang menangani logika async (panggilan API)
// dan secara otomatis mengelola state loading/error.
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            // Panggil endpoint login backend
            const response = await api.post('/api/v1/auth/login', credentials);

            // Tampilkan response di konsol untuk debugging jika perlu
            console.log('Backend Login Response:', JSON.stringify(response.data, null, 2));

            // Ambil objek 'data' dari respons
            const responseData = response.data.data;

            // Destructuring sesuai dengan struktur JSON dari backend
            const { user, token } = responseData;
            const { accessToken, refreshToken } = token;

            // Validasi: Pastikan kedua token ada sebelum melanjutkan
            if (!accessToken || !refreshToken) {
                return rejectWithValue({ message: 'Respons token tidak lengkap dari server.' });
            }

            // Simpan kedua token dengan aman menggunakan helper
            await saveTokens(accessToken, refreshToken);

            // Kembalikan accessToken sebagai token utama dan data user ke state global
            return { token: accessToken, user };

        } catch (error) {
            // Jika login gagal, kirim pesan error dari backend
            if (error.response) {
                console.error('Login Error Response:', error.response.data);
                // Kirim pesan error yang lebih spesifik jika ada
                return rejectWithValue(error.response.data.message || 'Username atau password salah.');
            }
            // Error jaringan atau server tidak aktif
            console.error('Network/Server Error:', error.message);
            return rejectWithValue({ message: 'Tidak dapat terhubung ke server.' });
        }
    }
);

export const updateUserName = createAsyncThunk(
    'users/updateName',
    async ({ fullName }, { rejectWithValue }) => {
        try {
            const response = await api.patch('/api/v1/users', { fullName });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Gagal memperbarui nama.' });
        }
    }
);

export const updateUserAvatar = createAsyncThunk(
    'users/updateAvatar',
    async ({ formData }, { rejectWithValue }) => {
        try {
            const response = await api.post('/api/v1/users/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Gagal mengunggah avatar.' });
        }
    }
);
// --- Slice (Irisan State) untuk Autentikasi ---
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: null, // Ini akan menyimpan accessToken
        isAuthenticated: false,
        isLoading: false,
        error: null,
    },
    // Reducers untuk aksi sinkron (langsung)
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            // Hapus kedua token menggunakan helper
            deleteTokens();
        },
        clearAuthError: (state) => {
            state.error = null;
        }
    },
    // ExtraReducers untuk menangani state dari aksi async (createAsyncThunk)
    extraReducers: (builder) => {
        builder
            // Saat login dimulai
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            // Saat login berhasil
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            // Saat login gagal
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // --- KASUS UNTUK UPDATE NAMA ---
            .addCase(updateUserName.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateUserName.fulfilled, (state, action) => {
                state.isLoading = false;
                // Perbarui data user di state
                state.user = action.payload;
            })
            .addCase(updateUserName.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // --- KASUS UNTUK UPDATE AVATAR ---
            .addCase(updateUserAvatar.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateUserAvatar.fulfilled, (state, action) => {
                state.isLoading = false;
                // Perbarui hanya field imageUrl pada user state yang ada
                if (state.user) {
                    state.user.imageUrl = action.payload.imageUrl;
                }
            })
            .addCase(updateUserAvatar.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
