import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import api from '../../api/axiosConfig';
import { fontPixel } from '../../helper';

const RegisterScreen = ({ navigation }) => {
    const [fullname, setFullname] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);


    const validateFullname = (fullname) => {
        if (!fullname) return 'fullname tidak boleh kosong';
        if (fullname.length < 2) return 'fullname minimal 2 karakter';
        if (!/^[A-Za-z\s]+$/.test(fullname)) return 'fullname hanya boleh berisi huruf dan spasi';
        return '';
    };

    const validateUsername = (username) => {
        if (!username) return 'Username tidak boleh kosong';
        if (username.length < 4) return 'Username minimal 4 karakter';
        if (!/^[a-zA-Z]/.test(username)) return 'Username harus diawali dengan huruf';
        if (!/^[a-zA-Z0-9]+$/.test(username)) return 'Username hanya boleh berisi huruf dan angka';
        return '';
    };

    // Validasi Email
    const validateEmail = (email) => {
        if (!email) return 'Email tidak boleh kosong';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Format email tidak valid';
        return '';
    };

    // Validasi Password
    const validatePassword = (password) => {
        if (!password) return 'Password tidak boleh kosong';
        if (password.length < 8) return 'Password minimal 8 karakter';
        return '';
    };

    // Validasi Confirm Password
    const validateConfirmPassword = (confirmPassword, password) => {
        if (!confirmPassword) return 'Konfirmasi password tidak boleh kosong';
        if (confirmPassword !== password) return 'Password tidak cocok';
        return '';
    };

    // Validasi semua field
    const validateForm = () => {
        const newErrors = {};

        newErrors.fullname = validateFullname(fullname);
        newErrors.username = validateUsername(username);
        newErrors.email = validateEmail(email);
        newErrors.password = validatePassword(password);
        newErrors.confirmPassword = validateConfirmPassword(confirmPassword, password);

        // Filter out empty errors
        const filteredErrors = Object.keys(newErrors).reduce((acc, key) => {
            if (newErrors[key]) acc[key] = newErrors[key];
            return acc;
        }, {});

        setErrors(filteredErrors);
        return Object.keys(filteredErrors).length === 0;
    };

    // Handle input change with real-time validation
    const handleInputChange = (field, value) => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }

        switch (field) {
            case 'fullname': setFullname(value); break;
            case 'username': setUsername(value); break;
            case 'email': setEmail(value); break;
            case 'password': setPassword(value); break;
            case 'confirmPassword': setConfirmPassword(value); break;
        }
    };

    const handleRegister = async () => {
        setIsSubmitted(true);
        if (!validateForm()) {
            console.log('Form invalid');
            return;
        }

        setIsLoading(true); // Mulai loading

        try {
            const requestBody = {
                fullName: fullname,
                username: username,
                email: email,
                password: password,
            };

            const response = await api.post('/api/v1/auth/register', requestBody);

            console.log('Response data:', response.data);
            Toast.show({
                type: 'success',
                text1: 'Sukses',
                text2: 'Registrasi berhasil! Silakan login.',
            });
            navigation.navigate('Login');

        } catch (error) {
            // Axios secara otomatis melempar error untuk status code non-2xx
            if (error.response && error.response.status === 409) {
                const errorMessage = error.response.data.message || "Data sudah terdaftar.";
                if (errorMessage.toLowerCase().includes('username')) {
                    setErrors(prev => ({ ...prev, username: errorMessage }));
                } else if (errorMessage.toLowerCase().includes('email')) {
                    setErrors(prev => ({ ...prev, email: errorMessage }));
                } else {
                    setErrors(prev => ({ ...prev, form: errorMessage }));
                }
            } else {
                const errorMessage = error.response?.data?.message || 'Tidak dapat terhubung ke server.';
                setErrors(prev => ({ ...prev, form: errorMessage }));
            }
        } finally {
            setIsLoading(false); // Hentikan loading, baik berhasil maupun gagal
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <View style={styles.screenContainer}>
            <FocusAwareStatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
            />
            <ScrollView contentContainerStyle={styles.container}>

                <Text style={styles.title}>Daftar</Text>
                <Text style={styles.subtitle}>Buat akun baru untuk memulai</Text>

                <View style={styles.form}>
                    <CustomTextInput
                        label="Fullname"
                        value={fullname}
                        onChangeText={(value) => handleInputChange('fullname', value)}
                        placeholder="Masukkan fullname Anda"
                        error={errors.fullname}
                    />
                    <CustomTextInput
                        label="Username"
                        value={username}
                        onChangeText={(value) => handleInputChange('username', value)}
                        placeholder="Masukkan username Anda"
                        error={errors.username}
                    />
                    <CustomTextInput
                        label="Email"
                        value={email}
                        onChangeText={(value) => handleInputChange('email', value)}
                        placeholder="contoh@email.com"
                        keyboardType="email-address"
                        error={errors.email}
                    />
                    <CustomTextInput
                        label="Kata Sandi"
                        value={password}
                        onChangeText={(value) => handleInputChange('password', value)}
                        placeholder="Masukkan kata sandi"
                        secureTextEntry={!showPassword}
                        error={errors.password}
                        rightIcon={
                            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={20}
                                    color={COLORS.gray}
                                />
                            </TouchableOpacity>
                        }
                    />
                    <CustomTextInput
                        label="Konfirmasi Kata Sandi"
                        value={confirmPassword}
                        onChangeText={(value) => handleInputChange('confirmPassword', value)}
                        placeholder="Masukkan ulang kata sandi"
                        secureTextEntry={!showConfirmPassword}
                        error={errors.confirmPassword}
                        rightIcon={
                            <TouchableOpacity onPress={toggleConfirmPasswordVisibility} style={styles.eyeIcon}>
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                                    size={20}
                                    color={COLORS.gray}
                                />
                            </TouchableOpacity>
                        }
                    />
                </View>

                {errors.form && <Text style={styles.formErrorText}>{errors.form}</Text>}

                <Text style={styles.termsText}>
                    Dengan mendaftar, Anda menyetujui <Text style={styles.linkText}>Ketentuan Layanan</Text> dan <Text style={styles.linkText}>Kebijakan Privasi</Text> kami.
                </Text>

                <CustomButton
                    title={isLoading ? 'Mendaftar...' : 'Daftar'}
                    onPress={handleRegister}
                    disabled={isLoading}
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Sudah punya akun? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={[styles.footerText, styles.linkText]}>Masuk</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
        marginTop: 20,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.gray,
        marginBottom: 32,
    },
    form: {
        width: '100%',
        marginBottom: 16,
    },
    eyeIcon: {
        padding: 5,
    },
    termsText: {
        fontSize: 12,
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: 24,
        marginHorizontal: 20,
    },
    linkText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.borderColor,
    },
    dividerText: {
        marginHorizontal: 10,
        color: COLORS.gray,
    },
    socialLoginContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        borderRadius: 8,
        paddingVertical: 12,
        marginHorizontal: 5,
    },
    socialButtonText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        paddingTop: 20,
    },
    footerText: {
        fontSize: 14,
        color: COLORS.text,
    },
    formErrorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 16,
        fontSize: fontPixel(14),
    },
    termsText: {
        fontSize: 12,
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: 24,
        marginHorizontal: 20,
    },
    linkText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});

export default RegisterScreen;