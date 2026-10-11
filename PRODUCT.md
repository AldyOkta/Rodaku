# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Stack
Expo + React Native (JavaScript), Expo Router, expo-sqlite, expo-notifications

## Users
- **Utama:** Pemilik motor atau mobil pribadi usia 20-40 tahun yang melakukan servis berkala di bengkel umum atau resmi. Butuh cara cepat mencatat servis dan pengingat tepat waktu.
- **Kedua:** Pengemudi online/ojol dan komuter harian yang ingin memantau kilometer dan biaya operasional kendaraan secara akurat.

## Product Purpose
Aplikasi pencatatan servis kendaraan dan BBM yang super cepat (< 30 detik per catatan), offline-first tanpa ketergantungan internet/cloud, dengan sistem pengingat otomatis sebelum batas servis atau pajak jatuh tempo tercapai.

## Positioning
Logbook kendaraan offline-first yang berfokus pada kecepatan input di tempat (SPBU/bengkel) dan pengingat dwi-faktor (kilometer & tanggal jatuh tempo) berbasis data lokal milik pengguna sendiri, tanpa iklan, tanpa login akun, dan tanpa beban sinkronisasi eksternal di MVP.

## Operating Context
- Digunakan langsung di lokasi seperti bengkel, SPBU, atau garasi rumah.
- Sering kali berada dalam kondisi koneksi internet lemah atau tanpa sinyal sama sekali.
- Layar dan interaksi harus tetap responsif, terbaca jelas di bawah terik matahari/lingkungan bengkel (high-contrast automotive dark mode), serta nyaman untuk navigasi satu tangan di perangkat Android kelas menengah ke bawah.

## Capabilities and Constraints
- **100% Offline-first:** Seluruh data (kendaraan, catatan servis, pengingat, pengaturan) disimpan lokal menggunakan SQLite (`expo-sqlite`).
- **Pencatatan Cepat (< 30s):** Alur catat servis & BBM minimalis dengan auto-fill isian terakhir dan input angka odometer/biaya yang taktis.
- **Logika Pengingat Dwi-Faktor:** Servis berikutnya dihitung berdasarkan kilometer atau tanggal (mana yang tercapai lebih dulu). Ambang default: 500 km atau 7 hari sebelum jatuh tempo.
- **Validasi Odometer:** Odometer baru tidak boleh lebih kecil dari catatan sebelumnya (peringatan informatif, tidak memblokir jika terjadi penggantian speedometer).
- **Notifikasi Lokal:** Penjadwalan pengingat servis, pajak tahunan, dan STNK 5 tahunan via `expo-notifications`.
- **Ekspor & Impor:** Backup data mandiri ke file JSON/ekspor lokal.

## Brand Commitments
- **Nama:** Rodaku
- **Desain UI:** Mengacu pada sistem desain Google Stitch "Veloce Log" (Tactile-utilitarian Android dark theme, warna aksen amber `#F59E0B`, racing orange `#EA580C`, emerald `#10B981`, tipografi Plus Jakarta Sans & Inter monospaced/tabular figures).

## Evidence on Hand
- PRD lengkap di `PRD_Rodaku.md`.
- Skema database SQLite teruji di `schema.sql`.
- Desain sistem & 5 rancangan layar lengkap di Google Stitch project `projects/11485863330979720699` ("PRD Mobile UI Design" / "Veloce Log"):
  - Garasi - Beranda Kendaraan (`ff6235bb72e84756beedd259a5093598`)
  - Catat Servis & BBM Cepat (`a38a8234b81740ba8f9da04fd941659d`)
  - Riwayat Catatan Servis (`cc7629aa552d49a6b6c1ae259d76a4fc`)
  - Pengingat Servis & Pajak (`1e0416be32a54b3d90a16e79d49c1b92`)
  - Analitik - Biaya & Efisiensi (`8ab240d2709e4f58b7115a82be7b4f4f`)

## Product Principles
1. **Speed First (< 30 Detik):** Formulir seringan mungkin, mengurangi friksi input saat pengguna berada di bengkel atau SPBU.
2. **Reliable Dual-Trigger:** Jangan biarkan pengguna telat ganti oli atau bayar pajak; kalkulasi km vs tanggal harus selalu presisi.
3. **Data Sovereign & Offline:** Data sepenuhnya milik pengguna di HP mereka sendiri, tanpa backend, tanpa tracking, dapat diekspor kapan saja.
4. **Mechanical Clarity:** UI mengadopsi estetika kluster instrumen otomotif berdensitas tinggi, kontras tinggi, dan taktil.

## Accessibility & Inclusion
- Target sentuh minimum 48×48 dp untuk seluruh tombol dan aksi cepat.
- Kontras warna tinggi di atas kanvas gelap `#0F172A` / `#0B1326` agar mudah terbaca dalam kondisi silau luar ruangan.
- Angka odometer dan nominal biaya menggunakan angka tabular monospaced untuk keterbacaan instan.
