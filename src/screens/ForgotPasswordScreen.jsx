import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Keyboard, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/colors';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);

    const validateEmail = () => {
        Keyboard.dismiss();
        let newError = null;
        if (!email) {
            newError = 'Email tidak boleh kosong';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newError = 'Format email tidak valid';
        }

        setError(newError);
        return !newError; // Return true jika tidak ada error
    };

    const handleSendLink = () => {
        if (validateEmail()) {
            console.log('Mengirim link reset ke:', email);

            navigation.navigate('ResetLinkSent', { email: email });
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lupa Kata Sandi</Text>
                    <View style={{ width: 24 }} />
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
                                setError(null); // Hapus error saat pengguna mulai mengetik
                            }
                        }}
                        placeholder="Email"
                        keyboardType="email-address"
                        error={error}
                    />
                </View>

                <CustomButton
                    title="Kirim Link Reset"
                    onPress={handleSendLink}
                    style={{ backgroundColor: COLORS.primary, borderRadius: 24, paddingVertical: 15 }}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    backButton: {
        padding: 5, // biar area sentuh lebih besar
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    content: {
        flex: 1,
    },
    description: {
        fontSize: 16,
        color: COLORS.text,
        lineHeight: 24,
        marginBottom: 32,
    },
});

export default ForgotPasswordScreen;
