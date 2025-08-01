import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Modal, Pressable, Platform, StatusBar, ActivityIndicator, Clipboard, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserName, updateUserAvatar, clearAuthError } from '../store/authSlice';
import { fontPixel, pixelSizeVertical } from '../../helper';
import { LinearGradient } from 'expo-linear-gradient';


const InfoRow = ({ label, value, iconName, onIconPress }) => (
    <View style={styles.infoRowContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <View style={styles.infoValueContainer}>
            <Text style={styles.infoValue}>{value}</Text>
            {iconName && (
                <TouchableOpacity onPress={onIconPress} style={styles.infoIcon}>
                    <Ionicons name={iconName} size={fontPixel(20)} color={COLORS.gray} />
                </TouchableOpacity>
            )}
        </View>
    </View>
);


const EditProfileScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user, isLoading, error: authError } = useSelector((state) => state.auth);
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [avatarUri, setAvatarUri] = useState(user?.imageUrl || null);
    const [newAvatarFile, setNewAvatarFile] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [nameError, setNameError] = useState('');

    const [isNameInputFocused, setIsNameInputFocused] = useState(false);

    // Validasi full name
    const validateFullName = (name) => {
        const trimmedName = name.trim();
        if (trimmedName.length < 2) {
            return 'Nama harus minimal 2 huruf';
        }
        // Regex untuk hanya huruf a-z dan spasi
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(trimmedName)) {
            return 'Nama hanya boleh mengandung huruf a-z';
        }
        return '';
    };
    // Cek apakah ada perubahan yang valid
    const hasValidChanges = () => {
        const isNameChanged = fullName.trim() !== user?.fullName && fullName.trim() !== '';
        const isAvatarChanged = newAvatarFile !== null;
        const isNameValid = validateFullName(fullName) === '';
        return (isNameChanged || isAvatarChanged) && isNameValid;
    };
    // useEffect menangani error dari Redux
    useEffect(() => {
        if (authError) {
            Toast.show({
                type: 'error',
                text1: 'Update Gagal',
                text2: authError.message || 'Terjadi kesalahan.',
            });
            dispatch(clearAuthError());
        }
    }, [authError, dispatch]);


    // Handle perubahan nama
    const handleNameChange = (text) => {
        setFullName(text);
        const error = validateFullName(text);
        setNameError(error);
    };

    const handleInputFocus = () => {
        setIsNameInputFocused(true);
    };

    const handleInputBlur = () => {
        setIsNameInputFocused(false);
    };

    const handleChangePhoto = () => {
        setIsModalVisible(true);
    };

    const handleSaveChanges = async () => {
        const trimmedName = fullName.trim();
        const isNameChanged = trimmedName !== user?.fullName && trimmedName !== '';
        const isAvatarChanged = newAvatarFile !== null;
        const nameValidation = validateFullName(fullName);

        // Validasi nama jika ada perubahan
        if (isNameChanged && nameValidation) {
            setNameError(nameValidation);
            Toast.show({
                type: 'error',
                text1: 'Validasi Gagal',
                text2: nameValidation,
            });
            return;
        }

        if (!isNameChanged && !isAvatarChanged) {
            Toast.show({
                type: 'info',
                text1: 'Tidak Ada Perubahan',
                text2: 'Anda belum mengubah nama atau foto profil.',
            });
            return;
        }

        // Bikin array buat nampung semua promise API call
        const updatePromises = [];

        // Kalo nama berubah, tambahin promise buat update nama
        if (isNameChanged) {
            updatePromises.push(dispatch(updateUserName({ fullName: trimmedName })));
        }

        // Kalo avatar berubah, tambahin promise buat update avatar
        if (isAvatarChanged) {
            const formData = new FormData();
            let localUri = newAvatarFile.uri;
            let filename = localUri.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;
            formData.append('avatar', { uri: localUri, name: filename, type });
            updatePromises.push(dispatch(updateUserAvatar({ formData })));
        }

        // Jalanin semua promise secara bersamaan
        try {
            const results = await Promise.all(updatePromises);
            // Cek ada yang gagal gak
            const hasFailed = results.some(result => result.meta.requestStatus === 'rejected');
            if (hasFailed) {
                console.log("Salah satu atau lebih update gagal.");
            } else {
                Toast.show({
                    type: 'success',
                    text1: 'Sukses',
                    text2: 'Profil berhasil diperbarui.',
                    onHide: () => navigation.goBack(),
                });
            }
        } catch (e) {
            console.log("Error saat menjalankan Promise.all:", e);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Terjadi kesalahan tak terduga.',
            });
        }
    };
    const takePhotoFromCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({
                type: 'error',
                text1: 'Izin Diperlukan',
                text2: 'Maaf, kami memerlukan izin kamera untuk melanjutkan.',
            });
            return;
        }


        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });


        if (!result.canceled) {
            setNewAvatarFile(result.assets[0]); // Simpan seluruh objek aset
            setAvatarUri(result.assets[0].uri);   // Perbarui preview gambar
        }
        setIsModalVisible(false);
    };

    const choosePhotoFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({
                type: 'error',
                text1: 'Izin Diperlukan',
                text2: 'Maaf, kami memerlukan izin galeri untuk melanjutkan.',
            });
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setNewAvatarFile(result.assets[0]); // Simpan seluruh objek aset
            setAvatarUri(result.assets[0].uri);   // Perbarui preview gambar
        }

        setIsModalVisible(false);
    };


    const copyToClipboard = (text) => {
        Clipboard.setString(text);
        Toast.show({
            type: 'info',
            text1: 'Disalin!',
            text2: `${text} telah disalin ke clipboard.`,
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const avatarSource = avatarUri ? { uri: avatarUri } : { uri: 'https://res.cloudinary.com/dyhlt43k7/image/upload/v1752392053/no-image_mijies.jpg' };
    const isSaveDisabled = !hasValidChanges() || isLoading;

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <LinearGradient
                colors={['#FDEAEB', '#E6ECF5']}
                style={styles.screenContainer}
            >
                <FocusAwareStatusBar
                    barStyle="dark-content"
                    backgroundColor="transparent"
                    translucent={true}
                />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <TouchableOpacity
                        onPress={handleSaveChanges}
                        style={[styles.headerButton, isSaveDisabled && styles.disabledButton]}
                        disabled={isSaveDisabled}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={COLORS.primary} />
                        ) : (
                            <Text style={[styles.saveText, isSaveDisabled && styles.disabledText]}>
                                Save
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
                <View style={styles.container}>
                    <View style={styles.avatarContainer}>
                        <Image source={avatarSource} style={styles.avatar} />
                        <TouchableOpacity onPress={handleChangePhoto}>
                            <Text style={styles.changePhotoText}>Change Photo</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Informasi yang Dapat Diubah</Text>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={[
                                styles.input,
                                isNameInputFocused && styles.inputFocused, // Style saat fokus
                                nameError && styles.inputError // Style saat error
                            ]}
                            value={fullName}
                            onChangeText={handleNameChange}
                            placeholder="Masukkan nama lengkap Anda"
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                        {nameError ? (
                            <Text style={styles.errorText}>{nameError}</Text>
                        ) : null}
                    </View>
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Informasi Akun</Text>
                        <InfoRow
                            label="Username"
                            value={`@${user?.username || ''}`}
                        />
                        <InfoRow
                            label="Email"
                            value={user?.email || ''}
                            iconName="copy-outline"
                            onIconPress={() => copyToClipboard(user?.email)}
                        />
                        <InfoRow
                            label="Terdaftar sejak"
                            value={formatDate(user?.createdAt)}
                            iconName="calendar-outline"
                        />
                    </View>
                </View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={() => {
                        setIsModalVisible(!isModalVisible);
                    }}
                >
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => setIsModalVisible(false)} // Menutup modal saat area luar ditekan
                    >
                        {/* Menggunakan Pressable agar konten modal tidak ikut menutup saat ditekan */}
                        <Pressable style={styles.modalContent}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Ionicons name="close-circle" size={28} color={COLORS.gray} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButton} onPress={takePhotoFromCamera}>
                                <Text style={styles.modalButtonText}>Ambil Gambar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, { borderBottomWidth: 0 }]} onPress={choosePhotoFromGallery}>
                                <Text style={styles.modalButtonText}>Pilih dari Galeri</Text>
                            </TouchableOpacity>
                        </Pressable>
                    </Pressable>
                </Modal>
            </LinearGradient>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    screenContainer: { flex: 1, backgroundColor: COLORS.white, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
    headerButton: { padding: 5, alignItems: 'flex-end' },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    saveText: { fontSize: 16, color: COLORS.primary, fontWeight: 'bold' },
    disabledButton: { opacity: 0.5 },
    disabledText: { color: COLORS.gray },
    container: { flex: 1, padding: 20 },
    avatarContainer: { alignItems: 'center', marginVertical: 20 },
    avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
    changePhotoText: { fontSize: 16, color: COLORS.primary, fontWeight: 'bold' },
    formContainer: { marginTop: 20 },
    label: { fontSize: 14, color: COLORS.text, marginBottom: 8, fontWeight: '500' },
    input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 15, fontSize: 16, borderWidth: 1, borderColor: 'transparent' },
    inputFocused: { borderColor: COLORS.primary, backgroundColor: '#fff', },
    inputError: { borderColor: '#ff4444', backgroundColor: '#fff5f5' },
    errorText: { color: '#ff4444', fontSize: 12, marginTop: 5, fontWeight: '500' },
    sectionContainer: { marginBottom: pixelSizeVertical(25) },
    sectionTitle: { fontSize: fontPixel(18), fontWeight: 'bold', color: COLORS.text, marginBottom: pixelSizeVertical(15) },
    infoRowContainer: { marginBottom: pixelSizeVertical(15) },
    infoLabel: { fontSize: fontPixel(14), color: COLORS.gray, marginBottom: 4 },
    infoValueContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    infoValue: { fontSize: fontPixel(16), color: COLORS.text, fontWeight: '500' },
    infoIcon: { padding: 5 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingVertical: 20, paddingTop: 40 },
    modalButton: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
    modalButtonText: { fontSize: fontPixel(18), color: COLORS.primary },
    closeButton: { position: 'absolute', top: 10, right: 15, padding: 5 },
});

export default EditProfileScreen;