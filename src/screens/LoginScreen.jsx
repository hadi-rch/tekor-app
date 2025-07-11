import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';

import { loginUser, clearAuthError } from '../store/authSlice';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

const LoginScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    //useDispatch untuk mengirim action
    const dispatch = useDispatch();

    //Ambil state dari Redux store
    const { isLoading, error: authError, isAuthenticated } = useSelector((state) => state.auth);

    //Efek untuk menangani navigasi setelah login
    useEffect(() => {
        if (isAuthenticated) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainApp' }],
            });
        }
    }, [isAuthenticated, navigation]);

    //Efek untuk menampilkan error dari Redux
    useEffect(() => {
        if (authError) {
            Toast.show({
                type: 'error',
                text1: 'Login Gagal',
                text2: authError.message || 'Terjadi kesalahan.',
                visibilityTime: 5000
            });
        }

        // Fungsi cleanup untuk membersihkan error saat komponen unmount
        return () => {
            dispatch(clearAuthError());
        };
    }, [authError, dispatch]);

    const handleInputChange = (name, value) => {
        setFormData(prevState => ({ ...prevState, [name]: value }));
        // Saat pengguna mulai mengetik, hapus pesan error untuk field tersebut
        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const handleLogin = () => {
        const { username, password } = formData;
        const newErrors = {};

        if (!username.trim()) {
            newErrors.username = 'Username tidak boleh kosong';
        } else if (username.length < 4) {
            newErrors.username = 'Username minimal 4 karakter';
        }

        if (!password.trim()) {
            newErrors.password = 'Kata sandi tidak boleh kosong';
        } else if (password.length < 8) {
            newErrors.password = 'Password minimal 8 karakter';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            dispatch(loginUser({ username, password }));
        }
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    return (
        <View style={styles.screenContainer}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Selamat Datang</Text>
                <Text style={styles.subtitle}>Silahkan masuk untuk melanjutkan</Text>

                <View style={styles.form}>
                    <CustomTextInput
                        label="Username"
                        value={formData.username}
                        onChangeText={(value) => handleInputChange('username', value)}
                        placeholder="username"
                        error={errors.username}
                    />
                    <CustomTextInput
                        label="Kata Sandi"
                        value={formData.password}
                        onChangeText={(value) => handleInputChange('password', value)}
                        placeholder="Masukkan kata sandi"
                        secureTextEntry={!showPassword}
                        error={errors.password}
                        rightIcon={
                            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color={COLORS.gray} />
                            </TouchableOpacity>
                        }
                    />
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotPassword}>
                    <Text style={styles.linkText}>Lupa Kata Sandi?</Text>
                </TouchableOpacity>

                {/* Tombol akan dinonaktifkan saat loading */}
                <CustomButton
                    title={isLoading ? 'Loading...' : 'Masuk'}
                    onPress={handleLogin}
                    disabled={isLoading}
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Belum punya akun? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={[styles.footerText, styles.linkText]}>Daftar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: { flex: 1, backgroundColor: COLORS.white, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, },
    container: { flexGrow: 1, padding: 24, justifyContent: 'center', },
    title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 16, color: COLORS.gray, textAlign: 'center', marginBottom: 40 },
    form: { width: '100%' },
    forgotPassword: { width: '100%', alignItems: 'flex-end', marginBottom: 24, },
    linkText: { color: COLORS.primary, fontWeight: 'bold' },
    footer: { flexDirection: 'row', justifyContent: 'center', paddingTop: 40 },
    footerText: { fontSize: 14, color: COLORS.text },
    eyeIcon: { padding: 10, }
});

export default LoginScreen;
