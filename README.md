# Presentra API

**Presentra API** adalah backend server berbasis **Node.js (Express + TypeScript)** untuk sistem presensi digital sekolah — menangani autentikasi, manajemen data master, pencatatan kehadiran, monitoring, pelaporan, hingga analitik untuk Admin dan Guru BK.

---

## 🏛️ Arsitektur

Project ini menggunakan **Clean Architecture** berlapis:

```
Route → Controller → Service → DB (Drizzle ORM)
```

```
src/
├── config/           # Firebase Admin SDK
├── db/               # Schema & koneksi database (Drizzle)
├── middlewares/      # auth, role, error, secretary-scope
├── types/            # AppError & Express.Request augmentation
├── utils/            # Response helpers (sendSuccess, sendOk, dll)
├── services/         # Business logic & query DB
│   ├── admin.service.ts
│   ├── qr.service.ts
│   ├── dashboard.service.ts
│   ├── laporan.service.ts
│   ├── bk.service.ts
│   └── notification.service.ts
├── controllers/      # Thin layer: validasi → panggil service → kirim response
└── routes/           # Definisi endpoint & middleware per-resource
```

---

## 🚀 Fitur & Role

| Role | Akses |
|------|-------|
| **Admin** | Full CRUD data master (kelas, siswa, mapel, jadwal, pengguna), manajemen QR, dashboard |
| **Guru** | Scan QR absensi, lihat jadwal hari ini |
| **Sekretaris** | Input absensi siswa per kelas |
| **BK** | Dashboard statistik, top alfa, laporan |

---

## 🛠️ Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MySQL |
| ORM | Drizzle ORM |
| Auth | Firebase Admin SDK |
| Scheduler | node-cron |
| Laporan | ExcelJS |

---

## 📦 Instalasi

```bash
# 1. Clone
git clone https://github.com/username/presentra-api.git
cd presentra-api

# 2. Install dependencies
npm install

# 3. Konfigurasi .env
cp .env.example .env
# Edit: DATABASE_URL, PORT, FIREBASE_CREDENTIALS

# 4. Push database schema
npm run db:push

# 5. (Opsional) Seed data awal
npm run db:seed

# 6. Jalankan server
npm run dev          # Development (tsx watch)
npm run build && npm start  # Production
```

### Environment Variables

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=mysql://user:pass@localhost:3306/db_presentra
FIREBASE_CREDENTIALS=./path/to/firebase-service-account.json
```

### Dev Mode Bypass Auth

Untuk testing lokal tanpa Firebase token, tambahkan header:
```
x-bypass-auth: true
x-bypass-user-id: 1     # ID user di DB (default: Admin)
```

---

## 📚 Dokumentasi Endpoint

### 🔐 Auth
| Method | Path | Deskripsi |
|--------|------|-----------|
| POST | `/api/auth/sync-device` | Sinkronisasi FCM token device |

---

### 🏠 Dashboard *(Admin, BK)*
| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/dashboard/summary` | Stats card: total siswa, guru, kelas, absensi hari ini |
| GET | `/api/dashboard/chart?periode=weekly\|monthly` | Data tren absensi harian (7 atau 30 hari) |

---

### 👥 Admin — Pengguna / Guru
| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/admin/pengguna` | List semua pengguna (semua role) |
| POST | `/api/admin/pengguna` | Tambah pengguna baru |
| PUT | `/api/admin/pengguna/:id` | Edit data pengguna |
| DELETE | `/api/admin/pengguna/:id` | Hapus pengguna |

### 🏫 Admin — Kelas & QR
| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/admin/kelas` | List semua kelas |
| POST | `/api/admin/kelas` | Tambah kelas |
| PUT | `/api/admin/kelas/:id` | Edit kelas |
| DELETE | `/api/admin/kelas/:id` | Hapus kelas |
| GET | `/api/admin/kelas/:id/qr` | Ambil QR Code kelas (auto-generate jika belum ada) |
| POST | `/api/admin/kelas/:id/qr/regenerate` | Regenerate QR token baru |

### 🎓 Admin — Siswa
| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/admin/siswa` | List semua siswa (include nama kelas) |
| POST | `/api/admin/siswa` | Tambah siswa |
| PUT | `/api/admin/siswa/:id` | Edit siswa |
| DELETE | `/api/admin/siswa/:id` | Hapus siswa |

### 📖 Admin — Mata Pelajaran
| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/admin/mapel` | List semua mapel |
| POST | `/api/admin/mapel` | Tambah mapel |
| PUT | `/api/admin/mapel/:id` | Edit mapel |
| DELETE | `/api/admin/mapel/:id` | Hapus mapel |

### 📅 Admin — Jadwal
| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/admin/jadwal-mengajar` | List semua jadwal (include nama guru, kelas, mapel) |
| POST | `/api/admin/jadwal-mengajar` | Buat jadwal mengajar |
| DELETE | `/api/admin/jadwal-mengajar/:id` | Hapus jadwal mengajar |
| GET | `/api/admin/jadwal-piket` | List semua jadwal piket (include nama guru) |
| POST | `/api/admin/jadwal-piket` | Buat jadwal piket |
| DELETE | `/api/admin/jadwal-piket/:id` | Hapus jadwal piket |

---

### 📋 Absensi
| Method | Path | Role | Deskripsi |
|--------|------|------|-----------|
| POST | `/api/absen/guru/scan-guru` | Guru | Scan QR presensi guru |
| GET | `/api/absen/guru/history` | Guru | History absensi guru |
| POST | `/api/absen/siswa/absen` | Sekretaris | Input absensi massal siswa |
| GET | `/api/absen/siswa/recap` | Sekretaris | Rekap harian kelas |
| GET | `/api/absen/siswa/detail` | Sekretaris | Detail per siswa |

---

### 🗓️ Jadwal Guru
| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/jadwal/hari-ini` | Jadwal mengajar guru hari ini |

---

### 🔍 Monitoring Piket *(Guru, Admin)*
| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/piket/monitoring` | Status input absensi semua kelas |
| GET | `/api/piket/kelas/:kelasId/detail` | Detail per kelas |

---

### 📊 BK *(BK, Admin)*
| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/bk/statistik-hari-ini` | Ringkasan alfa & terlambat hari ini |
| GET | `/api/bk/top-alfa?periode=minggu\|bulan` | Top 10 siswa dengan alfa terbanyak |

---

### 📄 Laporan *(Admin, BK, Guru)*
| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/laporan/rekap` | Preview rekap absensi sebagai JSON |
| GET | `/api/laporan/export` | Download rekap absensi format Excel |

**Query params yang didukung:**
```
?kelasId=1
?bulan=2&tahun=2026
?startDate=2026-02-01&endDate=2026-02-28
```

---

### 🔔 Notifikasi
| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/notifications` | List notifikasi user |
| PUT | `/api/notifications/:id/read` | Tandai sudah dibaca |

---

## 🗄️ Schema Database

| Tabel | Deskripsi |
|-------|-----------|
| `users` | Semua pengguna (admin, guru, sekretaris, bk) |
| `kelas` | Data kelas |
| `siswa` | Data siswa |
| `qr_kelas` | QR token per kelas untuk scan absensi |
| `mapel` | Mata pelajaran |
| `jadwal_mengajar` | Jadwal guru mengajar |
| `jadwal_piket` | Jadwal guru piket |
| `absen_guru` | Record kehadiran guru |
| `absen_siswa` | Record kehadiran siswa |
| `notifications` | Notifikasi push in-app |
| `user_devices` | FCM token per device |

---

*Dibuat untuk mendukung operasional sekolah yang lebih efisien dan transparan.*
