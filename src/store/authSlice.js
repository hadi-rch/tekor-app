import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// Menggunakan alias 'SecureStore' untuk konsistensi
import * as SecureStore from 'expo-secure-store';
// Menggunakan helper untuk menyimpan dan menghapus token
import { saveTokens, deleteTokens } from '../../utils/authStorage';
import api from '../../api/axiosConfig';
import { use } from 'react';


// --- Async Thunk untuk Login ---
// Ini adalah fungsi yang menangani logika async (panggilan API)
// dan secara otomatis mengelola state loading/error.
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            // --- Langkah 1: Lakukan login untuk mendapatkan token ---
            console.log('Mencoba login dengan:', credentials);
            const loginResponse = await api.post('/api/v1/auth/login', credentials);

            const loginData = loginResponse.data.data;
            const { accessToken, refreshToken } = loginData.token;

            if (!accessToken || !refreshToken) {
                return rejectWithValue({ message: 'Respons token tidak lengkap dari server.' });
            }

            // Simpan token terlebih dahulu agar bisa digunakan oleh interceptor
            await saveTokens(accessToken, refreshToken);
            console.log('Token berhasil disimpan.');

            // --- Langkah 2: Ambil profil lengkap dengan token baru ---
            try {
                console.log('Mencoba mengambil profil pengguna...');
                // Axios interceptor akan secara otomatis menambahkan token ke header request ini.
                // Pastikan endpoint '/api/v1/users/profile' ada di backend Anda.
                const profileResponse = await api.get('/api/v1/users');

                const userProfile = profileResponse.data;
                console.log("userProfile:", userProfile);
                console.log("profileResponse.data:", profileResponse.data);
                console.log("profileResponse.data.data:", profileResponse.data.data);
                console.log('Profil berhasil diambil:', userProfile);

                // Kembalikan token dan data profil yang LENGKAP
                return { token: accessToken, user: userProfile };

            } catch (profileError) {
                // Tangani error JIKA HANYA pengambilan profil yang gagal
                console.error('--- PROFILE FETCH ERROR ---');
                if (profileError.response) {
                    console.error('STATUS:', profileError.response.status);
                    console.error('DATA:', JSON.stringify(profileError.response.data, null, 2));
                } else {
                    console.error('MESSAGE:', profileError.message);
                }
                console.error('---------------------------');

                // Logout untuk membersihkan token yang mungkin salah
                await deleteTokens();
                return rejectWithValue({ message: 'Login berhasil, tetapi gagal mengambil data profil.' });
            }

        } catch (loginError) {
            // Tangani error JIKA login awal gagal
            console.error('--- INITIAL LOGIN ERROR ---');
            if (loginError.response) {
                console.error('STATUS:', loginError.response.status);
                console.error('DATA:', JSON.stringify(loginError.response.data, null, 2));
            } else {
                console.error('MESSAGE:', loginError.message);
            }
            console.error('---------------------------');

            return rejectWithValue(loginError.response?.data || { message: 'Tidak dapat terhubung ke server.' });
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
