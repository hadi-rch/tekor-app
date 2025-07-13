import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard, StatusBar, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axiosConfig';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { pixelSizeVertical, fontPixel } from '../../helper';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = () => {
        Keyboard.dismiss();
        let newError = null;
        if (!email) {
            newError = 'Email tidak boleh kosong';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newError = 'Format email tidak valid';
        }
        setError(newError);
        return !newError;
    };

    const handleSendLink = async () => {
        if (validateEmail()) {
            setIsLoading(true);
            try {
                const response = await api.post('/api/v1/auth/forgot-password', { email });
                

                Alert.alert("Permintaan Terkirim", response.data.message || 'Jika email terdaftar, link reset telah dikirim.');
                navigation.navigate('ResetLinkSent', { email: email });

            } catch (err) {
                console.log("Forgot Password Error:", err);
                let errorMessage = 'Gagal mengirim permintaan. Silakan coba lagi.';

                if (err.response) {
                    // Jika ada respons dari server (meskipun error)
                    console.log("Error Data:", err.response.data);
                    // Cek jika ada pesan error spesifik dari backend
                    if (err.response.data && err.response.data.message) {
                        errorMessage = err.response.data.message;
                    } else {
                        //klo gk ada pesan spesifik, kasih pesan umum berdasarkan status code
                        errorMessage = `Terjadi kesalahan pada server (Status: ${err.response.status}).`;
                    }
                } else {
                    //klo gk ada respons sama sekali (masalah jaringan)
                    errorMessage = 'Tidak dapat terhubung ke server. Pastikan koneksi internet dan alamat IP server sudah benar.';
                }

                Alert.alert('Error', errorMessage);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <View style={styles.screenContainer}>
            <FocusAwareStatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
            />
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={fontPixel(24)} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lupa Kata Sandi</Text>
                    <View style={{ width: fontPixel(24) }} />
                </View>

                <View style={styles.content}>
                    <Text style={styles.description}>
                        Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
                    </Text>

                    <CustomTextInput
                        label="Alamat Email"
                        value={email}
                        onChangeText={(value) => {
                            setEmail(value);
                            if (error) {
                                setError(null);
                            }
                        }}
                        placeholder="Email"
                        keyboardType="email-address"
                        error={error}
                    />
                </View>

                <CustomButton
                    title={isLoading ? "Mengirim..." : "Kirim Link Reset"}
                    onPress={handleSendLink}
                    disabled={isLoading}
                    style={{ backgroundColor: COLORS.primary, borderRadius: 24, paddingVertical: 15, marginBottom: pixelSizeVertical(50) }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: { flex: 1, backgroundColor: COLORS.white, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    container: { flex: 1, padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    backButton: { padding: 5 },
    headerTitle: { fontSize: fontPixel(20), fontWeight: 'bold', color: COLORS.text },
    content: { flex: 1 },
    description: { fontSize: fontPixel(16), color: COLORS.text, lineHeight: fontPixel(24), marginBottom: 32 },
});

export default ForgotPasswordScreen;
