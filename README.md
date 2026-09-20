# Presentra API

REST API backend for **Presentra**, a QR-based school attendance and management platform. The API powers the Presentra Web dashboard and other Presentra clients with authentication, master-data management, attendance workflows, reporting, notifications, and attendance monitoring.

Related repository: [Presentra Web](https://github.com/Myankoi/presentra-web)

## Features

- Firebase Authentication with role-based access control.
- Master-data management for users, classes, students, subjects, teaching schedules, and duty schedules.
- QR-based teacher attendance.
- Bulk student attendance entry for class secretaries.
- Attendance dashboards, duty monitoring, counseling statistics, and top-absence reports.
- JSON attendance recap and Excel export.
- Excel import for users and teaching schedules.
- In-app notifications and Firebase Cloud Messaging device registration.
- Scheduled attendance reminders in the `Asia/Jakarta` timezone.

## Roles

| Role | Main responsibilities |
| --- | --- |
| `admin` | Manage users, classes, students, subjects, schedules, QR codes, dashboards, and reports. |
| `guru` | Scan teacher attendance, view teaching schedules, check duty assignments, and monitor attendance. |
| `sekretaris` | Submit and review student attendance for the class linked to the account. |
| `bk` | View attendance dashboards, counseling statistics, top-absence data, and reports. |

## Tech Stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js |
| Framework | Express 5 |
| Language | TypeScript |
| Database | MySQL-compatible database |
| ORM | Drizzle ORM |
| Authentication | Firebase Admin SDK |
| File processing | ExcelJS and Multer |
| Scheduler | node-cron |
| Security middleware | Helmet and CORS |

## Architecture

The API follows a layered structure:

```text
Route -> Middleware -> Controller -> Service -> Drizzle ORM -> MySQL
```

```text
src/
├── config/           # Firebase Admin configuration
├── controllers/      # HTTP request handling and response mapping
├── db/               # Drizzle connection, schema, and seed script
├── middlewares/      # Authentication, roles, uploads, scopes, and errors
├── routes/           # API route definitions grouped by domain
├── services/         # Business logic and database operations
├── tasks/            # Scheduled background tasks
├── types/            # Shared types and Express request extensions
└── utils/            # Response and notification helpers
```

## Prerequisites

- Node.js 18 or newer.
- npm.
- MySQL or another MySQL-compatible database.
- A Firebase project with Firebase Authentication enabled.
- A Firebase Admin SDK service-account JSON file.

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Myankoi/presentra-api.git
cd presentra-api
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Update `.env` with the database connection and the path to the Firebase service-account file. Keep the service-account JSON outside version control; `serviceAccountKey.json` is ignored by Git.

### 3. Prepare the database

Push the current Drizzle schema to the configured database:

```bash
npm run db:push
```

The optional seed command contains project-specific seed logic and expects prerequisite data such as an existing class. Review `src/db/seed.ts` before running it against a real database:

```bash
npm run db:seed
```

### 4. Run the API

```bash
npm run dev
```

The server listens on `http://localhost:3000` by default and also prints a local-network URL for device testing.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | HTTP port. Defaults to `3000`. |
| `NODE_ENV` | No | Runtime environment. Set to `development` for local-only auth bypass support. |
| `DATABASE_URL` | Yes | MySQL connection URL used by Drizzle and the application. |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Yes | Relative or absolute path to the Firebase Admin service-account JSON file. Defaults to `./serviceAccountKey.json`. |

Example:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=mysql://root:password@127.0.0.1:3306/presentra
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

## Authentication

Protected endpoints expect a Firebase ID token in the standard bearer format:

```http
Authorization: Bearer <firebase-id-token>
```

The API verifies the token with Firebase Admin SDK and then maps the Firebase UID to a record in the `users` table.

### Local development bypass

For local development only, the authentication middleware accepts:

```http
x-bypass-auth: true
x-bypass-user-id: 1
```

This works only when `NODE_ENV=development`. Never enable or expose this mechanism in production.

### User provisioning note

The user-creation service currently provisions new Firebase accounts with a backend-defined default password. Users should change their password immediately after the first login. The default password is intentionally not published in this public README.

## API Reference

The default base URL is:

```text
http://localhost:3000/api
```

Unless noted otherwise, endpoints require Firebase authentication. Role restrictions are enforced by middleware.

### Authentication and profile

| Method | Endpoint | Role | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/sync-device` | Authenticated | Register or update an FCM device token. |
| `POST` | `/auth/change-password` | Authenticated | Generate a Firebase password-reset link. |
| `POST` | `/auth/logout` | Authenticated | Remove an FCM token and revoke the Firebase session. |
| `GET` | `/users/me` | Authenticated | Get the current user's profile. |
| `PUT` | `/users/me` | Authenticated | Update the current user's display name. |
| `POST` | `/users` | `admin` | Create a user and synchronize the Firebase account. |
| `POST` | `/users/bulk-import` | `admin` | Import users from an `.xlsx` file using multipart field `file`. |

### Admin: users, classes, students, and subjects

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/admin/pengguna` | List all users. |
| `POST` | `/admin/pengguna` | Create a user record. |
| `PUT` | `/admin/pengguna/:id` | Update a user record. |
| `DELETE` | `/admin/pengguna/:id` | Delete a user record. |
| `GET` | `/admin/kelas` | List classes. |
| `POST` | `/admin/kelas` | Create a class. |
| `PUT` | `/admin/kelas/:id` | Update a class. |
| `DELETE` | `/admin/kelas/:id` | Delete a class. |
| `GET` | `/admin/kelas/:id/qr` | Get or generate a class QR code. |
| `POST` | `/admin/kelas/:id/qr/regenerate` | Regenerate a class QR token. |
| `GET` | `/admin/siswa` | List students with class information. |
| `POST` | `/admin/siswa` | Create a student. |
| `PUT` | `/admin/siswa/:id` | Update a student. |
| `DELETE` | `/admin/siswa/:id` | Delete a student. |
| `GET` | `/admin/mapel` | List subjects. |
| `POST` | `/admin/mapel` | Create a subject. |
| `PUT` | `/admin/mapel/:id` | Update a subject. |
| `DELETE` | `/admin/mapel/:id` | Delete a subject. |

### Admin: schedules

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/admin/jadwal-mengajar` | List teaching schedules. |
| `POST` | `/admin/jadwal-mengajar` | Create a teaching schedule. |
| `DELETE` | `/admin/jadwal-mengajar/:id` | Delete a teaching schedule. |
| `POST` | `/admin/jadwal-mengajar/bulk-import` | Import teaching schedules from an `.xlsx` file using field `file`. |
| `GET` | `/admin/jadwal-piket` | List duty schedules. |
| `POST` | `/admin/jadwal-piket` | Create a duty schedule. |
| `DELETE` | `/admin/jadwal-piket/:id` | Delete a duty schedule. |

Supported weekday values are `senin`, `selasa`, `rabu`, `kamis`, and `jumat`.

### Attendance

| Method | Endpoint | Role | Description |
| --- | --- | --- | --- |
| `POST` | `/absen/guru/scan-guru` | `guru` | Record teacher attendance from a scanned QR token. |
| `GET` | `/absen/guru/history` | `guru` | Get the authenticated teacher's attendance history. |
| `POST` | `/absen/siswa/absen` | `sekretaris` | Submit or update bulk student attendance. |
| `GET` | `/absen/siswa/recap` | `sekretaris` | Get attendance recap for the linked class. |
| `GET` | `/absen/siswa/detail` | `sekretaris` | Get student attendance details for a date. |
| `GET` | `/absen/siswa/summary` | `sekretaris` | Get today's attendance summary for the linked class. |

Student attendance status values are `hadir`, `izin`, `sakit`, `alfa`, and `terlambat`. The secretary attendance submission is restricted to 07:30 WIB and is scoped to the class linked to the secretary account.

### Dashboards, schedules, and monitoring

| Method | Endpoint | Role | Description |
| --- | --- | --- | --- |
| `GET` | `/dashboard/summary` | `admin`, `bk` | Get school-wide summary statistics. |
| `GET` | `/dashboard/chart?periode=weekly\|monthly` | `admin`, `bk` | Get weekly or monthly attendance trends. |
| `GET` | `/dashboard/summary-guru` | `admin`, `guru`, `bk` | Get the authenticated teacher's dashboard summary. |
| `GET` | `/jadwal/hari-ini?hari=senin` | `guru` | Get a teacher's schedule for a day; defaults to today. |
| `GET` | `/jadwal/piket-hari-ini` | `guru` | Check whether the authenticated teacher is on duty today. |
| `GET` | `/jadwal/kelas/:kelasId?hari=senin` | `guru`, `admin` | Get a class schedule for a day. |
| `GET` | `/piket/monitoring` | `guru`, `admin` | Monitor class attendance submission status. |
| `GET` | `/piket/kelas/:kelasId/detail` | `guru`, `admin` | Get attendance details for one class. |

### Counseling and reports

| Method | Endpoint | Role | Description |
| --- | --- | --- | --- |
| `GET` | `/bk/statistik-hari-ini` | `bk`, `admin` | Get today's late and absent statistics. |
| `GET` | `/bk/top-alfa?periode=minggu\|bulan` | `bk`, `admin` | Get the top students by absence count. |
| `GET` | `/laporan/rekap` | `admin`, `bk`, `guru` | Preview attendance recap as JSON. |
| `GET` | `/laporan/export` | `admin`, `bk`, `guru` | Download attendance recap as an `.xlsx` file. |

Report filters can include:

```text
?kelasId=1
?bulan=02&tahun=2026
?startDate=2026-02-01&endDate=2026-02-28
```

Use either a date range or a month/year filter. `kelasId` is optional.

### Notifications

| Method | Endpoint | Role | Description |
| --- | --- | --- | --- |
| `GET` | `/notifications` | Authenticated | List notifications for the current user. |
| `GET` | `/notifications/unread-count` | Authenticated | Get the unread notification count. |
| `PUT` | `/notifications/:id/read` | Authenticated | Mark one notification as read. |
| `PUT` | `/notifications/mark-all-read` | Authenticated | Mark all notifications as read. |
| `POST` | `/notifications/test` | Authenticated | Send a test notification. Restrict or remove this endpoint before production if it is not needed. |

## Request Examples

### Create a user

```http
POST /api/users
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

```json
{
  "nama": "Budi Santoso",
  "email": "budi@sekolah.id",
  "role": "guru",
  "linkedSiswaId": null
}
```

### Submit student attendance

```http
POST /api/absen/siswa/absen
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

```json
{
  "dataAbsensi": [
    { "siswaId": 1, "status": "hadir" },
    { "siswaId": 2, "status": "izin", "keterangan": "Sakit perut" },
    { "siswaId": 3, "status": "alfa" }
  ]
}
```

### Scan teacher attendance

```json
{
  "tokenQr": "qr_token_from_scan"
}
```

### Import users from Excel

Send a multipart/form-data request to `/api/users/bulk-import` with the file field named `file`. The first worksheet must include these headers:

```text
NAMA | EMAIL | ROLE | KODE_GURU
```

`NAMA`, `EMAIL`, and `ROLE` are required. `KODE_GURU` is optional. Each row is processed independently and the response includes processed, successful, failed, and error counts.

## Database Schema

| Table | Purpose |
| --- | --- |
| `users` | Admins, teachers, secretaries, and counseling users. |
| `kelas` | Classes and academic years. |
| `siswa` | Student records linked to classes. |
| `qr_kelas` | Active QR token for each class. |
| `mapel` | Subjects. |
| `jadwal_mengajar` | Teacher, class, subject, weekday, and time assignments. |
| `jadwal_piket` | Teacher duty assignments by weekday. |
| `absen_guru` | Teacher attendance records. |
| `absen_siswa` | Student attendance records and notes. |
| `notifications` | In-app notifications. |
| `user_devices` | FCM device tokens. |

## Scheduled Tasks

The API starts two reminder jobs when the server starts:

- At 07:15 WIB on weekdays, remind secretaries whose classes have not submitted attendance.
- At 07:31 WIB on weekdays, notify scheduled duty teachers about classes that have not submitted attendance.

Both jobs use the `Asia/Jakarta` timezone and require notification/device data to be configured correctly.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run the API with `tsx watch`. |
| `npm run db:push` | Push the Drizzle schema to the configured database. |
| `npm run db:studio` | Open Drizzle Studio. |
| `npm run db:seed` | Run the project-specific seed script. |

The repository does not currently define `build` or `start` npm scripts. Add and verify production scripts before deploying a compiled build.

## Related Repositories

- [Presentra Web](https://github.com/Myankoi/presentra-web) — React/Vite admin dashboard consuming this API.

The web application uses the API base URL from `VITE_API_URL`, which should normally point to this API's `/api` base path, for example `http://localhost:3000/api` during local development.

## Postman Collection

The repository includes [`Presentra_API.postman_collection.json`](./Presentra_API.postman_collection.json) with request examples for the main API domains. Set the collection variables before sending requests:

| Variable | Example |
| --- | --- |
| `baseUrl` | `http://localhost:3000` |
| `token` | Firebase ID token |

## Security Notes

- Never commit `.env`, Firebase service-account JSON files, database credentials, or Firebase ID tokens.
- Restrict CORS origins before production deployment.
- Disable the development auth bypass outside local development.
- Review the test-notification endpoint before exposing the API publicly.
- Change newly provisioned user passwords immediately after first login.

## License

No standalone license file is currently included in this repository. Add an explicit `LICENSE` file before publishing the project for reuse by third parties.
