import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/colors';

const LoginScreen = ({ navigation }) => {
    // 1. Gunakan satu state untuk semua data form
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    // 2. Buat fungsi handleInputChange yang generik
    const handleInputChange = (name, value) => {
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
        // Hapus error untuk field yang sedang diisi
        if (errors[name]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: null,
            }));
        }
    };

    const validateForm = () => {
        Keyboard.dismiss(); // Tutup keyboard saat validasi
        let newErrors = {};
        // Validasi Email
        if (!formData.email) {
            newErrors.email = 'Email tidak boleh kosong';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }
        // Validasi Password
        if (!formData.password) {
            newErrors.password = 'Kata sandi tidak boleh kosong';
        }

        setErrors(newErrors);
        // Return true jika tidak ada error (Object.keys(newErrors).length === 0)
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = () => {
        if (validateForm()) {
            // Logika untuk login jika form valid
            console.log('Data yang akan dikirim:', formData);
            // navigation.navigate('MainApp'); // Contoh navigasi setelah login
        } else {
            console.log('Validasi gagal:', errors);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>

                <Text style={styles.title}>Selamat Datang</Text>
                <Text style={styles.subtitle}>Silahkan masuk untuk melanjutkan</Text>

                <View style={styles.form}>
                    <CustomTextInput
                        label="Email"
                        value={formData.email}
                        onChangeText={(value) => handleInputChange('email', value)}
                        placeholder="contoh@email.com"
                        keyboardType="email-address"
                        error={errors.email} // Pass error message
                    />
                    <CustomTextInput
                        label="Kata Sandi"
                        value={formData.password}
                        onChangeText={(value) => handleInputChange('password', value)}
                        placeholder="Masukkan kata sandi"
                        secureTextEntry={!showPassword}
                        error={errors.password} // Pass error message
                        rightIcon={ // Pass ikon ke komponen
                            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={22}
                                    color={COLORS.gray}
                                />
                            </TouchableOpacity>
                        }
                    />
                </View>

                <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.linkText}>Lupa Kata Sandi?</Text>
                </TouchableOpacity>

                <CustomButton title="Masuk" onPress={handleLogin} />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Belum punya akun? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={[styles.footerText, styles.linkText]}>Daftar</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.white },
    container: {
        flexGrow: 1, // Menggunakan flexGrow agar bisa scroll jika konten panjang
        padding: 24,
        justifyContent: 'center', // Pusatkan konten secara vertikal
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: 40
    },
    form: {
        width: '100%'
    },
    forgotPassword: {
        width: '100%',
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    linkText: {
        color: COLORS.primary,
        fontWeight: 'bold'
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: 40 // Beri jarak dari tombol Masuk
    },
    footerText: {
        fontSize: 14,
        color: COLORS.text
    },
    eyeIcon: {
        padding: 10, // Area klik yang lebih besar untuk ikon
    }
});


export default LoginScreen;