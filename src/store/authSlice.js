import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { saveTokens, deleteTokens } from '../../utils/authStorage';
import api from '../../api/axiosConfig';


export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const loginResponse = await api.post('/api/v1/auth/login', credentials);

            const loginData = loginResponse.data.data;
            const { accessToken, refreshToken } = loginData.token;

            if (!accessToken || !refreshToken) {
                return rejectWithValue({ message: 'Respons token tidak lengkap dari server.' });
            }

            await saveTokens(accessToken, refreshToken);
            console.log('Token berhasil disimpan.');

            try {
                const profileResponse = await api.get('/api/v1/users');
                const userProfile = profileResponse.data;
                return { token: accessToken, user: userProfile };

            } catch (profileError) {
                // Log error hanya di development
                if (__DEV__) {
                    console.log('Profile fetch error:', {
                        status: profileError.response?.status,
                        data: profileError.response?.data,
                        message: profileError.message
                    });
                }


                // Logout untuk membersihkan token yang mungkin salah
                await deleteTokens();
                return rejectWithValue({ message: 'Login berhasil, tetapi gagal mengambil data profil.' });
            }

        } catch (loginError) {
            if (__DEV__) {
                console.log('Login error:', {
                    status: loginError.response?.status,
                    data: loginError.response?.data,
                    message: loginError.message
                });
            }

            // Return error yang lebih terstruktur
            const errorResponse = loginError.response?.data || {
                message: 'Tidak dapat terhubung ke server.',
                code: 'NETWORK_ERROR'
            };

            return rejectWithValue(errorResponse);
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
