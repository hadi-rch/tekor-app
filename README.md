# Tekor (Aplikasi Belajar Bahasa Korea)

Aplikasi mobile interaktif untuk membantu pengguna mempelajari try out eps topik dan permainan yang menyenangkan.

<!-- Placeholder untuk screenshot atau GIF aplikasi -->
<!-- <p align="center">
  <img src="link-ke-screenshot-1.png" width="200" alt="Screenshot 1">
  &nbsp; &nbsp; &nbsp;
  <img src="link-ke-screenshot-2.png" width="200" alt="Screenshot 2">
  &nbsp; &nbsp; &nbsp;
  <img src="link-ke-screenshot-3.png" width="200" alt="Screenshot 3">
</p> -->

---

## 🚀 Fitur Utama

- **Materi Pembelajaran:** Akses modul pembelajaran yang terstruktur (teks, audio, dan video).
- **Latihan Interaktif:** Uji pemahaman dengan berbagai jenis soal dan kuis.
- **Evaluasi & Ujian:** Ikuti tes evaluasi untuk mengukur kemajuan belajar Anda.
- **Permainan Edukatif:** Belajar sambil bermain dengan game seperti *Memory Card*.
- **Autentikasi Pengguna:** Sistem login, registrasi, dan manajemen profil yang aman.
- **Riwayat Transaksi:** Lihat riwayat pembelian atau akses materi premium.

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

- **Framework:** React Native (Expo)
- **Bahasa:** JavaScript
- **State Management:** Redux Toolkit
- **Navigasi:** React Navigation
- **UI Library:** StyleSheet standar & Komponen Kustom
- **API Client:** Axios
- **Backend Service:** API REST Kustom

---

## ⚙️ Prasyarat

Pastikan perangkat Anda telah terinstal perangkat lunak berikut:

- **Node.js**: Versi `>=18.0.0`
- **Yarn** (direkomendasikan) atau **NPM**
- **Watchman** (untuk pengguna macOS)
- **JDK**: Versi 11 atau lebih tinggi
- **Android Studio** & **Android SDK** (untuk development Android)
- **Xcode** (untuk development iOS)
- **Expo CLI**: `npm install -g expo-cli`

---

## 📦 Instalasi & Setup

1.  **Clone Repositori**
    ```bash
    git clone https://github.com/hadi-rch/tekor-app.git
    cd tekor-app
    ```

2.  **Install Dependencies**
    Gunakan NPM (direkomendasikan) atau Yarn untuk menginstal semua dependensi proyek.
    ```bash
    npm install
    ```
    atau
    ```bash
    yarn install
    ```

3.  **Setup Variabel Lingkungan (Environment Variables)**
    Buat file `.env` di direktori root proyek dan tambahkan variabel yang diperlukan.
    ```bash
    touch .env
    ```
    Contoh isi file `.env`:
    ```env
    API_URL=https://api.backend-tekor.com/v1
    API_KEY=your_secret_api_key_if_any
    ```

4.  **Install Pods (untuk iOS)**
    Jika Anda melakukan development untuk iOS, masuk ke direktori `ios` dan install pods.
    ```bash
    cd ios && pod install
    ```

---

## ▶️ Menjalankan Proyek

Setelah instalasi selesai, jalankan perintah berikut untuk memulai aplikasi:

- **Untuk Menjalankan di Android:**
  ```bash
  yarn android
  ```
  atau
  ```bash
  npm run android
  ```

- **Untuk Menjalankan di iOS:**
  ```bash
  yarn ios
  ```
  atau
  ```bash
  npm run ios
  ```

---

## 📂 Struktur Folder Penting

Proyek ini memiliki struktur folder yang dirancang untuk skalabilitas dan kemudahan navigasi.

```
mobile-tekor/
├── src/
│   ├── api/         # Konfigurasi Axios dan interceptor
│   ├── assets/      # Gambar, font, dan aset statis lainnya
│   ├── components/  # Komponen UI kustom yang dapat digunakan kembali
│   ├── constants/   # Nilai konstan (warna, font, endpoint API)
│   ├── navigation/  # Konfigurasi React Navigation (Stack & Tab Navigator)
│   ├── screens/     # Semua layar atau halaman aplikasi
│   ├── services/    # Fungsi untuk berinteraksi dengan API backend
│   └── store/       # Konfigurasi Redux Toolkit (store, slice, reducer)
├── .env             # File environment variables (tidak ada di repo)
└── App.js           # Entry point utama aplikasi
```

- **`src/screens`**: Berisi semua komponen layar utama aplikasi (misal: `HomeScreen.jsx`, `LoginScreen.jsx`).
- **`src/components`**: Berisi komponen UI generik yang dapat digunakan di berbagai layar (misal: `CustomButton.jsx`, `StyledText.jsx`).
- **`src/navigation`**: Mengelola semua logika navigasi aplikasi, termasuk *stack* dan *tab navigator*.
- **`src/store`**: Pusat dari *state management*. Berisi konfigurasi Redux store, *slices*, dan *reducers*.
- **`src/services`**: Lapisan untuk berkomunikasi dengan layanan eksternal, terutama API backend.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **Lisensi MIT**. Lihat file `LICENSE` untuk detail lebih lanjut.
