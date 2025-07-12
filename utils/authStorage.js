import * as SecureStore from 'expo-secure-store';

// Definisikan kunci untuk kedua token
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Menyimpan kedua token
export const saveTokens = async (accessToken, refreshToken) => {
    try {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
        console.log('Gagal menyimpan token', error);
    }
};

// Mengambil accessToken
export const getAccessToken = async () => {
    try {
        return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
        console.log('Gagal mengambil access token', error);
        return null;
    }
};

// Mengambil refreshToken
export const getRefreshToken = async () => {
    try {
        return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
        console.log('Gagal mengambil refresh token', error);
        return null;
    }
};

// Menghapus kedua token saat logout
export const deleteTokens = async () => {
    try {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
        console.log('Gagal menghapus token', error);
    }
};
