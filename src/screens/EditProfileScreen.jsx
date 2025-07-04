import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    Pressable,
    Platform,
    StatusBar,
    ActivityIndicator,
    Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/colors';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserName, updateUserAvatar, clearAuthError } from '../store/authSlice';
import { fontPixel, pixelSizeVertical } from '../../helper';

// --- Komponen baru untuk menampilkan baris informasi read-only ---
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

// --- Komponen Utama EditProfileScreen ---
const EditProfileScreen = ({ navigation }) => {

    const dispatch = useDispatch();
    const { user, isLoading, error: authError } = useSelector((state) => state.auth);

    const [fullName, setFullName] = useState(user?.fullName || '');
    // const [avatar, setAvatar] = useState(user?.imageUrl || null); // State untuk URI gambar
    const [avatarUri, setAvatarUri] = useState(user?.imageUrl || null);

    const [newAvatarFile, setNewAvatarFile] = useState(null); // State untuk file gambar baru
    const [isModalVisible, setIsModalVisible] = useState(false);
    // useeffect menangani error dari Redux
    useEffect(() => {
        if (authError) {
            Alert.alert('Update Gagal', authError.message || 'Terjadi kesalahan.');
            dispatch(clearAuthError());
        }
    }, [authError, dispatch]);

    const handleChangePhoto = () => {
        setIsModalVisible(true); // Buka modal
    };

    const handleSaveChanges = async () => {
        const isNameChanged = fullName !== user?.fullName && fullName.trim() !== '';
        const isAvatarChanged = newAvatarFile !== null;

        if (!isNameChanged && !isAvatarChanged) {
            Alert.alert("Tidak Ada Perubahan", "Anda belum mengubah nama atau foto profil.");
            return;
        }// Buat array untuk menampung semua promise API call
        const updatePromises = [];

        // Jika nama berubah, tambahkan promise untuk update nama
        if (isNameChanged) {
            updatePromises.push(dispatch(updateUserName({ fullName })));
        }

        // Jika avatar berubah, tambahkan promise untuk update avatar
        if (isAvatarChanged) {
            const formData = new FormData();
            let localUri = newAvatarFile.uri;
            let filename = localUri.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;
            formData.append('avatar', { uri: localUri, name: filename, type });

            updatePromises.push(dispatch(updateUserAvatar({ formData })));
        }

        // Jalankan semua promise secara bersamaan
        try {
            const results = await Promise.all(updatePromises);

            // Cek apakah ada yang gagal
            const hasFailed = results.some(result => result.meta.requestStatus === 'rejected');

            if (hasFailed) {
                // Error sudah ditangani oleh useEffect, tidak perlu alert lagi di sini
                console.log("Salah satu atau lebih update gagal.");
            } else {
                Alert.alert(
                    "Sukses",
                    "Profil berhasil diperbarui.",
                    [
                        { text: "OK", onPress: () => navigation.goBack() }
                    ]
                );
            }
        } catch (e) {
            // Ini untuk menangkap error yang tidak terduga
            console.error("Error saat menjalankan Promise.all:", e);
            Alert.alert("Error", "Terjadi kesalahan tak terduga.");
        }
    };

    // Fungsi untuk meminta izin dan membuka kamera
    const takePhotoFromCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Izin Diperlukan', 'Maaf, kami memerlukan izin kamera untuk melanjutkan.');
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
    }

    // Fungsi untuk meminta izin dan membuka galeri
    const choosePhotoFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Izin Diperlukan', 'Maaf, kami memerlukan izin galeri untuk melanjutkan.');
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
    }

    const copyToClipboard = (text) => {
        Clipboard.setString(text);
        Alert.alert("Disalin!", `${text} telah disalin ke clipboard.`);
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

    const avatarSource = avatarUri ? { uri: avatarUri } : require('../../assets/images/g1.png');

    return (
        <View style={styles.screenContainer}>
            <FocusAwareStatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
            />
            {/* Header Kustom */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSaveChanges} style={styles.headerButton} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color={COLORS.primary} /> : <Text style={styles.saveText}>Save</Text>}
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                <View style={styles.avatarContainer}>
                    <Image source={avatarSource} style={styles.avatar} />
                    <TouchableOpacity onPress={handleChangePhoto}>
                        <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>
                </View>



                {/* --- Bagian Informasi yang Dapat Diubah --- */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Informasi yang Dapat Diubah</Text>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Masukkan nama lengkap Anda"
                    />
                </View>

                {/* --- Bagian Informasi Akun --- */}
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

            {/* Bottom Modal */}
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

        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    headerButton: {
        padding: 5,
        // minWidth: 50, // Beri lebar minimum agar layout stabil
        alignItems: 'flex-end',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    saveText: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        padding: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 10,
    },
    changePhotoText: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    formContainer: {
        marginTop: 20,
    },
    label: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
    },
    sectionContainer: {
        marginBottom: pixelSizeVertical(25),
    },
    sectionTitle: {
        fontSize: fontPixel(18),
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: pixelSizeVertical(15),
    },
    // Styles untuk InfoRow
    infoRowContainer: {
        marginBottom: pixelSizeVertical(15),
    },
    infoLabel: {
        fontSize: fontPixel(14),
        color: COLORS.gray,
        marginBottom: 4,
    },
    infoValueContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoValue: {
        fontSize: fontPixel(16),
        color: COLORS.text,
        fontWeight: '500',
    },
    infoIcon: {
        padding: 5,
    },
    // Styles untuk Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: 20,
        paddingTop: 40,
    },
    modalButton: {
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    modalButtonText: {
        fontSize: fontPixel(18),
        color: COLORS.primary,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 15,
        padding: 5,
    },
});

export default EditProfileScreen;
