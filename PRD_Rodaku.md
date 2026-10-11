# PRD: Aplikasi Catatan Servis Kendaraan

Versi 1.0 | Penulis: Aldy Oktaviano | Platform: Mobile (Android dulu, iOS menyusul) | Status: Draft

## 1. Latar Belakang dan Masalah

Hampir semua orang punya motor atau mobil, tetapi jarang yang mencatat servis, kilometer, dan pajaknya dengan rapi. Akibatnya orang lupa kapan terakhir ganti oli, telat bayar pajak atau perpanjang STNK, dan tidak tahu berapa sebenarnya biaya kendaraan per bulan. Catatan di buku servis bengkel atau chat WhatsApp mudah hilang dan tidak memberi pengingat.

## 2. Tujuan

- Membuat pencatatan servis dan BBM cukup cepat (kurang dari 30 detik per catatan).
- Mengingatkan pengguna sebelum servis, pajak, dan STNK jatuh tempo.
- Memberi gambaran biaya kendaraan yang jelas dari data milik pengguna sendiri.

**Ukuran berhasil (tahap awal):** dipakai sendiri secara rutin minimal 1 bulan, dan 5-10 teman pengguna mencatat minimal 3 kali dalam 2 minggu uji coba.

## 3. Target Pengguna

- **Utama:** pemilik motor atau mobil pribadi usia 20-40 tahun yang servis berkala di bengkel umum atau resmi.
- **Kedua:** pengemudi online/ojol dan pengguna kendaraan harian yang ingin memantau biaya operasional.

## 4. Fitur MVP

1. **Profil kendaraan.** Jenis (motor/mobil), nama, plat nomor, odometer saat ini, tanggal pajak tahunan dan masa berlaku STNK. Mendukung lebih dari satu kendaraan.
2. **Catat servis dan BBM.** Tanggal, kilometer, jenis (servis/ganti oli/BBM/lainnya), biaya, dan catatan singkat. Foto struk opsional.
3. **Pengingat.** Servis berikutnya berdasarkan kilometer atau tanggal (mana yang lebih dulu tercapai), serta pengingat pajak dan STNK. Memakai notifikasi lokal.

Pendukung MVP: riwayat per kendaraan, ringkasan biaya bulanan sederhana, dan ekspor/impor data (backup).

## 5. Tidak Dikerjakan Dulu (Out of Scope)

- Panduan atau estimasi harga servis umum (butuh sumber data akurat dan selalu diperbarui).
- Akun pengguna, login, dan sinkronisasi cloud.
- Backend, API, dan integrasi pihak ketiga.
- Booking bengkel, marketplace suku cadang, dan fitur sosial.
- Pemindaian struk otomatis (OCR) dan versi web.

## 6. Alur Pengguna Utama

1. Buka aplikasi dan tambah kendaraan (pertama kali).
2. Dari beranda, pilih kendaraan lalu ketuk tombol Catat.
3. Pilih jenis catatan, isi kilometer, biaya, dan catatan, lalu simpan.
4. Aplikasi menghitung ulang jadwal servis berikutnya dan menjadwalkan notifikasi.
5. Pengguna melihat riwayat dan ringkasan biaya di layar kendaraan.

## 7. Aturan Logika Inti

- Pengingat servis aktif ketika selisih kilometer atau tanggal dengan jadwal berikutnya mencapai ambang (misal 500 km atau 7 hari sebelum).
- Odometer baru tidak boleh lebih kecil dari catatan sebelumnya (beri peringatan, jangan blokir total, karena odometer bisa diganti).
- Interval default per jenis servis (misal oli motor) bisa diubah pengguna.
- Semua data tersimpan lokal dan tetap berfungsi tanpa internet.

## 8. Kebutuhan Non-Fungsional

- Berjalan offline sepenuhnya.
- Layar pencatatan terbuka dan tersimpan dengan cepat, bahkan di HP kelas menengah ke bawah.
- Data tidak dikirim ke server mana pun pada versi 1.
- Fitur ekspor/impor agar data aman saat ganti HP.

## 9. Rencana Teknis Ringkas

- Expo + React Native + TypeScript, Expo Router untuk navigasi.
- `expo-sqlite` untuk data lokal, `expo-notifications` untuk pengingat.
- Jest untuk unit test logika pengingat dan perhitungan biaya; tes manual untuk alur utama.
- Build lewat EAS (development dan satu build produksi).

## 10. Rencana Rilis

- **Minggu 1:** wireframe kasar 4-5 layar, skema database, profil kendaraan.
- **Minggu 2:** catat servis/BBM dan riwayat.
- **Minggu 3:** pengingat, unit test logika, ekspor/impor.
- **Minggu 4:** uji coba ke 5-10 teman, perbaikan, lalu putuskan fitur berikutnya.

## 11. Risiko

- **Notifikasi tidak muncul** karena pembatasan baterai di beberapa merek HP Android. Mitigasi: uji di beberapa perangkat dan beri panduan izin di dalam aplikasi.
- **Pengguna malas mencatat.** Mitigasi: form minimal, isian terakhir terisi otomatis, dan pengingat yang berguna.
- **Scope melebar.** Mitigasi: kembali ke bagian 5 setiap ada ide baru.

## 12. Setelah MVP (Kandidat)

- Estimasi biaya dari rata-rata data pengguna.
- Grafik konsumsi BBM (km per liter).
- Backup cloud dan sinkronisasi antar perangkat (saat itu API contract dan auth baru diperlukan).
- Panduan harga servis umum jika sudah ada basis pengguna.
