import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

const RegisterScreen = ({ navigation }) => {
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);    
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // State untuk error messages
    const [errors, setErrors] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Validasi Username
    const validateUsername = (username) => {
        if (!username) return 'Username tidak boleh kosong';
        if (username.length < 6) return 'Username minimal 6 karakter';
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
        
        newErrors.nama = validateUsername(nama);
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
        switch (field) {
            case 'nama':
                setNama(value);
                if (isSubmitted) {
                    setErrors(prev => ({ ...prev, nama: validateUsername(value) }));
                }
                break;
            case 'email':
                setEmail(value);
                if (isSubmitted) {
                    setErrors(prev => ({ ...prev, email: validateEmail(value) }));
                }
                break;
            case 'password':
                setPassword(value);
                if (isSubmitted) {
                    setErrors(prev => ({ 
                        ...prev, 
                        password: validatePassword(value),
                        confirmPassword: validateConfirmPassword(confirmPassword, value)
                    }));
                }
                break;
            case 'confirmPassword':
                setConfirmPassword(value);
                if (isSubmitted) {
                    setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(value, password) }));
                }
                break;
        }
    };

    const handleRegister = () => {
        setIsSubmitted(true);
        
        if (validateForm()) {
            // Logika untuk mendaftar
            console.log('Form valid:', { nama, email, password, confirmPassword });
            // navigation.navigate('MainApp'); // Contoh navigasi setelah daftar
        } else {
            console.log('Form invalid:', errors);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <ScrollView contentContainerStyle={styles.container}>

                <Text style={styles.title}>Daftar</Text>
                <Text style={styles.subtitle}>Buat akun baru untuk memulai</Text>

                <View style={styles.form}>
                    <CustomTextInput
                        label="Username"
                        value={nama}
                        onChangeText={(value) => handleInputChange('nama', value)}
                        placeholder="Masukkan username Anda"
                        error={errors.nama}
                        hasError={!!errors.nama}
                    />
                    <CustomTextInput
                        label="Email"
                        value={email}
                        onChangeText={(value) => handleInputChange('email', value)}
                        placeholder="contoh@email.com"
                        keyboardType="email-address"
                        error={errors.email}
                        hasError={!!errors.email}
                    />
                    <CustomTextInput
                        label="Kata Sandi"
                        value={password}
                        onChangeText={(value) => handleInputChange('password', value)}
                        placeholder="Masukkan kata sandi"
                        secureTextEntry={!showPassword}
                        error={errors.password}
                        hasError={!!errors.password}
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
                        hasError={!!errors.confirmPassword}
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

                <Text style={styles.termsText}>
                    Dengan mendaftar, Anda menyetujui <Text style={styles.linkText}>Ketentuan Layanan</Text> dan <Text style={styles.linkText}>Kebijakan Privasi</Text> kami.
                </Text>

                <CustomButton title="Daftar" onPress={handleRegister} />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Sudah punya akun? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={[styles.footerText, styles.linkText]}>Masuk</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.white,
        justifyContent: 'center', 
        padding: 25, 
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
});

export default RegisterScreen;