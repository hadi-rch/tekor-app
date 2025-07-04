import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard, Alert, Platform, StatusBar, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { fontPixel, pixelSizeHorizontal, pixelSizeVertical } from '../../helper';
import api from '../../api/axiosConfig';

const ValidationCriteria = ({ isValid, text }) => (
    <View style={styles.criteriaContainer}>
        <Ionicons
            name={isValid ? 'checkbox' : 'square-outline'}
            size={20}
            color={isValid ? COLORS.primary : COLORS.gray}
        />
        <Text style={[styles.criteriaText, { color: isValid ? COLORS.primary : COLORS.gray }]}>
            {text}
        </Text>
    </View>
);

const CreateNewPasswordScreen = ({ navigation, route }) => {
    // ini dummy doang Di aplikasi real, token dan email akan didapat dari deep link
    const { email, token } = route.params || {};
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLengthValid, setIsLengthValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!email || !token) {
            Alert.alert(
                "Error",
                "Informasi reset tidak ditemukan. Silakan coba lagi dari awal.",
                [{ text: "OK", onPress: () => navigation.navigate('Login') }]
            );
        }
    }, [email, token]);

    // Memeriksa panjang kata sandi setiap kali berubah
    useEffect(() => {
        setIsLengthValid(password.length >= 8);
    }, [password]);

    const handleSavePassword = async () => {
        Keyboard.dismiss();
        let newErrors = {};

        if (!password) {
            newErrors.password = 'Kata sandi baru tidak boleh kosong';
        } else if (!isLengthValid) {
            newErrors.password = 'Kata sandi harus minimal 8 karakter';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Konfirmasi kata sandi tidak boleh kosong';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Kata sandi tidak cocok';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setIsLoading(true);
            try {
                const requestBody = {
                    email: email,
                    token: token, // Token dari link email
                    newPassword: password,
                    confirmPassword: confirmPassword,
                };

                // Panggil endpoint backend Anda
                const response = await api.post('/api/v1/auth/reset-password', requestBody);

                Alert.alert(
                    "Berhasil!",
                    response.data.message || "Kata sandi Anda telah berhasil diubah.",
                    [{ text: "OK", onPress: () => navigation.navigate('Login') }]
                );

            } catch (err) {
                console.error("Reset Password Error:", err.response ? err.response.data : err.message);
                const errorMessage = err.response?.data?.message || 'Gagal mengubah kata sandi. Token mungkin tidak valid atau sudah kedaluwarsa.';
                Alert.alert('Error', errorMessage);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleModalOkPress = () => {
        setIsSuccessModalVisible(false);
        navigation.navigate('Login');
    };

    // Tampilkan loading atau pesan error jika email tidak ada
    if (!email) {
        return (
            <View style={styles.screenContainer}>
                <Text>Invalid navigation state.</Text>
            </View>
        );
    }

    return (
        <View style={styles.screenContainer}>
            <FocusAwareStatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
            />
            <View style={styles.container}>
                <View>
                    <Text style={styles.title}>Buat Kata Sandi Baru</Text>
                    <Text style={styles.description}>
                        Buat kata sandi baru untuk akun emailmu, <Text style={{ fontWeight: 'bold' }}>{email}</Text>
                    </Text>

                    <CustomTextInput
                        label="Kata Sandi Baru"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Masukkan kata sandi baru"
                        secureTextEntry={!showPassword}
                        error={errors.password}
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color={COLORS.gray} style={styles.eyeIcon} />
                            </TouchableOpacity>
                        }
                    />

                    <CustomTextInput
                        label="Konfirmasi Kata Sandi Baru"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Konfirmasi kata sandi baru"
                        secureTextEntry={!showConfirmPassword}
                        error={errors.confirmPassword}
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color={COLORS.gray} style={styles.eyeIcon} />
                            </TouchableOpacity>
                        }
                    />

                    <ValidationCriteria isValid={isLengthValid} text="Minimal 8 karakter" />
                </View>

                <View style={styles.buttonContainer}>
                    <CustomButton
                        title="Simpan Kata Sandi Baru"
                        onPress={handleSavePassword}
                        style={{ backgroundColor: COLORS.primary, borderRadius: 24, paddingVertical: 15, marginBottom: pixelSizeVertical(50) }}
                    />
                </View>
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isSuccessModalVisible}
                onRequestClose={() => setIsSuccessModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={handleModalOkPress}>
                    <Pressable>
                        <View style={styles.successModalContent}>
                            <View style={styles.successIconContainer}>
                                <Ionicons name="checkmark" size={fontPixel(40)} color={COLORS.white} />
                            </View>
                            <Text style={styles.successTitle}>Berhasil!</Text>
                            <Text style={styles.successSubtitle}>
                                Kata sandi Anda telah berhasil diubah. Silakan masuk dengan kata sandi baru Anda.
                            </Text>
                            <TouchableOpacity style={styles.successButton} onPress={handleModalOkPress}>
                                <Text style={styles.successButtonText}>Kembali ke Login</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

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
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: COLORS.text,
        lineHeight: 24,
        marginBottom: 32,
    },
    eyeIcon: {
        padding: 10,
    },
    criteriaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    criteriaText: {
        marginLeft: 8,
        fontSize: 14,
    },
    buttonContainer: {
        paddingBottom: 10,
    },

    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    successModalContent: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: pixelSizeHorizontal(20),
        alignItems: 'center',
    },
    successIconContainer: {
        width: pixelSizeHorizontal(70),
        height: pixelSizeHorizontal(70),
        borderRadius: pixelSizeHorizontal(35),
        backgroundColor: '#28a745',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: pixelSizeVertical(20),
    },
    successTitle: {
        fontSize: fontPixel(22),
        fontWeight: 'bold',
        marginBottom: pixelSizeVertical(10),
    },
    successSubtitle: {
        fontSize: fontPixel(16),
        textAlign: 'center',
        color: COLORS.gray,
        marginBottom: pixelSizeVertical(25),
        lineHeight: fontPixel(24),
    },
    successButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: pixelSizeVertical(12),
        paddingHorizontal: pixelSizeHorizontal(30),
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    successButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: fontPixel(16),
    },
});

export default CreateNewPasswordScreen;

