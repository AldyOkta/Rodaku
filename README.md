# 🏍️ Rodaku — Logbook Servis & Perawatan Presisi

[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2057-000020.svg?style=flat&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20(WAL)-003B57.svg?style=flat&logo=sqlite)](https://sqlite.org)
[![Offline First](https://img.shields.io/badge/Architecture-100%25%20Offline--First-10B981.svg?style=flat)](#)
[![Platform](https://img.shields.io/badge/Platform-Android-3DDC84.svg?style=flat&logo=android)](#)

> **Rodaku** adalah aplikasi buku catatan (*logbook*) digital untuk perawatan motor, mobil, dan pengisian BBM. Dirancang dengan fokus pada kecepatan input di tempat (**< 30 detik**) saat berada di bengkel atau SPBU, beroperasi **100% offline-first**, tanpa iklan, dan tanpa perlu membuat akun/login.

---

## 🌟 Fitur Utama

### 1. 🏎️ Garasi Multi-Kendaraan & Odometer Tracking
* Kelola motor dan mobil pribadi dalam satu aplikasi.
* Tampilan kluster instrumen odometer digital yang jelas dan presisi.
* Indikator status jatuh tempo Pajak Tahunan (PKB) dan masa berlaku STNK 5 tahunan.

### 2. ⚡ Pencatatan Kilat (< 30 Detik) & Validasi Odometer
* Tombol aksi cepat **Catat (+)** untuk ganti oli, servis berkala/CVT, ganti ban, rem, aki, BBM, atau pajak.
* Odometer terakhir otomatis terisi untuk mempercepat pengisian data.
* Dilengkapi validasi cerdas untuk mencegah salah ketik angka kilometer yang lebih rendah dari catatan sebelumnya.

### 3. 🔔 Logika Pengingat Dwi-Faktor (*Dual-Trigger Reminders*)
* Menghitung jadwal servis berikutnya berdasarkan **mana yang tercapai lebih dulu** antara **jarak kilometer ATAU waktu/tanggal** (misal: oli mesin tiap 2.000 km atau 60 hari).
* Bar progres visual status servis (*Normal*, *Peringatan*, hingga *Jatuh Tempo!*).
* Jadwal pengingat dapat disesuaikan (*custom interval*) kapan saja sesuai kebutuhan kendaraan.

### 4. 📊 Analitik Pengeluaran & Ekspor Laporan Servis
* Grafik proporsi biaya perawatan (persentase uang untuk bensin, oli, servis, atau suku cadang).
* Metrik efisiensi BBM dan total pengeluaran operasional.
* Fitur ekspor ringkasan catatan servis yang dapat dibagikan langsung ke WhatsApp (meningkatkan nilai jual kembali kendaraan dengan bukti perawatan lengkap).

### 5. 🛠️ Full CRUD Kontrol Penuh
* **Create, Read, Update, Delete** penuh untuk seluruh data:
  * Kelola profil kendaraan (nama, plat nomor, kilometer, tanggal pajak).
  * Koreksi catatan servis jika ada kesalahan input biaya atau tanggal.
  * Sesuaikan interval servis atau nonaktifkan pengingat tertentu.

### 6. 📴 100% Offline-First & Privasi Terjamin
* Seluruh data disimpan secara lokal menggunakan **SQLite** (`PRAGMA journal_mode = WAL;`) di penyimpanan privat HP Anda.
* Tetap berfungsi normal di basement bengkel atau area tanpa sinyal seluler.
* Data sepenuhnya milik Anda tanpa pelacakan atau server perantara.

---

## 🛠️ Tech Stack

| Lapisan | Teknologi |
| :--- | :--- |
| **Framework** | Expo SDK 57 (React Native 0.86) |
| **Navigasi** | Expo Router (File-based Routing, Stack & Tabs) |
| **Penyimpanan Lokal** | `expo-sqlite` (SQLite WAL Mode) |
| **Notifikasi** | `expo-notifications` |
| **Desain UI** | Custom High-Contrast Automotive Dark Theme |
| **Tipografi** | Plus Jakarta Sans & Inter Tabular Figures |

---

## 📁 Struktur Direktori

```text
Rodaku/
├── app/                        # Rute navigasi Expo Router
│   ├── (tabs)/                 # Bottom Tab Navigator
│   │   ├── index.js            # Layar Garasi Kendaraan
│   │   ├── records.js          # Layar Riwayat Catatan
│   │   ├── reminders.js        # Layar Pengingat Servis Dwi-Faktor
│   │   └── analytics.js        # Layar Analitik & Grafik Biaya
│   ├── records/
│   │   ├── new.js              # Modal Tambah Catatan Cepat
│   │   └── edit.js             # Modal Edit & Hapus Catatan
│   ├── vehicles/
│   │   ├── new.js              # Modal Tambah Kendaraan Baru
│   │   └── edit.js             # Modal Kelola/Edit Kendaraan
│   └── _layout.js              # Root Layout, StatusBar & Splash Screen
├── assets/                     # Aset ikon & splash screen
├── src/
│   ├── components/             # Komponen UI (HeaderBar, OdometerBox, dll.)
│   ├── constants/              # Token tema warna, font, dan ukuran
│   ├── db/
│   │   └── database.js         # Inisialisasi SQLite & Helper Fungsi CRUD
│   └── utils/
│       └── formatters.js       # Format Rupiah, Tanggal, & Kilometer
├── app.json                    # Konfigurasi aplikasi Expo & Android
├── eas.json                    # Konfigurasi build APK EAS
└── schema.sql                  # Skema database relasional SQLite
```

---

## 🚀 Panduan Menjalankan Proyek (Development)

### Prasyarat
* [Node.js](https://nodejs.org/) (versi 18 ke atas disarankan).
* Aplikasi **Expo Go** terpasang di smartphone Android Anda (unduh via Google Play Store).
* Smartphone dan laptop terhubung ke jaringan Wi-Fi yang sama (atau gunakan USB debugging).

### 1. Kloning Repositori
```bash
git clone https://github.com/AldyOkta/Rodaku.git
cd Rodaku
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Jalankan Server Pengembangan
```bash
npx expo start
```

### 4. Buka di HP
* Buka aplikasi **Expo Go** di HP Android.
* Pindai (*scan*) QR Code yang muncul di terminal Anda.
* Aplikasi akan langsung dimuat di layar HP.

---

## 📦 Panduan Build Menjadi APK Mandiri (Production)

Proyek ini telah dikonfigurasi dengan **EAS Build** ([`eas.json`](eas.json)) untuk menghasilkan file `.apk` mandiri tanpa ketergantungan pada Expo Go.

### 1. Login ke Akun Expo
```bash
npx eas-cli login
```

### 2. Buat File APK Standalone
```bash
npx eas-cli build -p android --profile preview
```
* Saat muncul pertanyaan pembuatan keystore, pilih **`Y`** (Yes) untuk membuat tanda tangan digital otomatis.
* Setelah proses build di cloud selesai (sekitar 3–5 menit), unduh file `.apk` dari link yang diberikan terminal dan pasang langsung di HP Android Anda.

### 3. Buat File AAB (Untuk Google Play Store)
Jika ingin merilis ke Google Play Console:
```bash
npx eas-cli build -p android --profile production
```

---

## 📄 Lisensi
Proyek ini dibuat untuk keperluan personal & open-source di bawah lisensi MIT. Silakan gunakan dan kembangkan sesuai kebutuhan perawatan kendaraan Anda!
