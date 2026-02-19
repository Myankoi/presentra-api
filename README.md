# Presentra API

**Presentra API** adalah backend server yang dibangun menggunakan Node.js (Express) dan TypeScript untuk mendukung aplikasi sistem presensi dan monitoring sekolah digital. API ini menangani logika bisnis utama mulai dari autentikasi, manajemen jadwal, pencatatan kehadiran (absensi), hingga pelaporan dan analitik untuk Guru BK.

## 🚀 Fitur Utama

API ini menyediakan endpoint untuk berbagai peran pengguna (Admin, Guru, Sekretaris Kelas, Guru BK):

*   **Autentikasi & Pengguna**: Login aman menggunakan Firebase Auth, manajemen role, dan sinkronisasi token notifikasi (FCM).
*   **Manajemen Master Data**: CRUD untuk Kelas, Siswa, Mata Pelajaran, dan Jadwal (Admin only).
*   **Jadwal Pelajaran**: Penjadwalan otomatis dan penyesuaian jadwal harian untuk guru.
*   **Absensi Digital**:
    *   **Guru**: Scan QR Code untuk presensi masuk/mengajar di kelas.
    *   **Siswa**: Input absensi massal oleh Sekretaris Kelas atau Guru Piket.
*   **Monitoring Piket**: Dashboard *real-time* untuk Guru Piket memantau kelengkapan absensi seluruh kelas.
*   **Dashboard BK**: Analitik siswa bermasalah (Top Alfa, kelas dengan tingkat ketidakhadiran tinggi) untuk tindak lanjut Guru BK.
*   **Laporan & Export**: Rekapitulasi absensi harian, bulanan, dan export data ke format Excel.
*   **Notifikasi**: Pengingat otomatis jadwal dan pemberitahuan status absensi via Firebase Cloud Messaging.

## 🛠️ Teknologi yang Digunakan

*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Language**: TypeScript
*   **Database**: MySQL
*   **ORM**: Drizzle ORM
*   **Auth & Notifications**: Firebase Admin SDK
*   **Tools Lain**: `node-cron` (Job Scheduler), `exceljs` (Laporan), `zod` (Validasi).

## 📦 Instalasi & Menjalankan Project

1.  **Clone Repository**
    ```bash
    git clone https://github.com/username/presentra-api.git
    cd presentra-api
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment**
    Buat file `.env` di root folder dan sesuaikan dengan konfigurasi database dan Firebase Anda:
    ```env
    PORT=3000
    DATABASE_URL=mysql://user:pass@localhost:3306/db_presentra
    FIREBASE_CREDENTIALS=./path/to/firebase-service-account.json
    ```

4.  **Jalankan Database Migration**
    ```bash
    npm run db:push
    ```

5.  **Jalankan Server**
    *   Mode Development:
        ```bash
        npm run dev
        ```
    *   Mode Production:
        ```bash
        npm run build
        npm start
        ```

## 📚 Dokumentasi Endpoint Singkat

### Auth
*   `POST /api/auth/sync-device` - Sinkronisasi token FCM device user.

### Jadwal
*   `GET /api/jadwal/hari-ini` - Mendapatkan jadwal mengajar guru hari ini.

### Absensi
*   `POST /api/absen/bulk` - Input absensi siswa satu kelas (Sekretaris).
*   `POST /api/absen/guru/scan-guru` - Scan QR untuk absensi guru.
*   `GET /api/absen/recap/daily` - Rekap harian status siswa.

### Monitoring Piket
*   `GET /api/piket/monitoring` - Dashboard status input absensi seluruh kelas.
*   `GET /api/piket/kelas/:id/detail` - Detail absensi per kelas.

### Laporan & BK
*   `GET /api/laporan/export` - Download laporan absensi (Excel).
*   `GET /api/bk/statistik-hari-ini` - Ringkasan statistik pelanggaran hari ini.
*   `GET /api/bk/top-alfa` - Daftar siswa dengan tingkat alpa tertinggi.

### Notifikasi
*   `GET /api/notifications` - List notifikasi user.
*   `PUT /api/notifications/:id/read` - Tandai notifikasi sudah dibaca.

### Admin (Master Data)
*   `CRUD` `/api/admin/kelas`, `/api/admin/siswa`, `/api/admin/mapel`
*   `CRUD` `/api/admin/jadwal-mengajar`, `/api/admin/jadwal-piket`

---
*Dibuat untuk mendukung operasional sekolah yang lebih efisien dan transparan.*
