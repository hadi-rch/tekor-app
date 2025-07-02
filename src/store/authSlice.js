import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import api from '../../api/axiosConfig';

// Kunci untuk menyimpan token di SecureStore
const TOKEN_KEY = 'auth_token';

// --- Async Thunk untuk Login ---
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            // Panggil endpoint login backend
            const response = await api.post('/api/v1/auth/login', credentials);

            console.log('Backend Response:', JSON.stringify(response.data, null, 2));

            // Mengambil objek 'data' dari respons
            const responseData = response.data.data;

            //Destructuring sesuai dengan struktur JSON dari backend
            const { user, token } = responseData;
            const accessToken = token.accessToken;

            // Validasi: Pastikan accessToken ada
            if (!accessToken) {
                return rejectWithValue({ message: 'Token tidak diterima dari server.' });
            }

            // Simpan accessToken dengan aman
            await SecureStore.setItemAsync(TOKEN_KEY, accessToken);

            // Kembalikan accessToken sebagai token ke state global
            return { token: accessToken, user };

        } catch (error) {
            if (error.response) {
                console.error('Login Error Response:', error.response.data);
                // Kirim pesan error yang lebih spesifik jika ada
                return rejectWithValue(error.response.data.message || error.response.data);
            }
            console.error('Network/Server Error:', error.message);
            return rejectWithValue({ message: 'Tidak dapat terhubung ke server.' });
        }
    }
);

// --- Slice (Irisan State) untuk Autentikasi ---
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            SecureStore.deleteItemAsync(TOKEN_KEY);
        },
        clearAuthError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
