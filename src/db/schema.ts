import { mysqlTable, int, varchar, mysqlEnum, timestamp, boolean, uniqueIndex, date, time, text } from "drizzle-orm/mysql-core";

// 1. USERS
export const users = mysqlTable("users", {
    id: int("id").primaryKey().autoincrement(),
    nama: varchar("nama", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    firebaseUid: varchar("firebase_uid", { length: 255 }).notNull().unique(),
    role: mysqlEnum("role", ["admin", "guru", "sekretaris", "bk"]).notNull(),
    linkedSiswaId: int("linked_siswa_id").references(() => siswa.id, { onDelete: 'set null' }), // FIXED
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// 2. KELAS
export const kelas = mysqlTable("kelas", {
    id: int("id").primaryKey().autoincrement(),
    namaKelas: varchar("nama_kelas", { length: 255 }).notNull(),
    tahunAjaran: varchar("tahun_ajaran", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

// 3. SISWA
export const siswa = mysqlTable('siswa', {
    id: int('id').primaryKey().autoincrement(),
    nis: varchar('nis', { length: 20 }).unique(),
    nama: varchar('nama', { length: 100 }).notNull(),
    jenisKelamin: mysqlEnum('jenis_kelamin', ['L', 'P']).notNull(),
    kelasId: int('kelas_id').notNull().references(() => kelas.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});

// 4. QR KELAS
export const qrKelas = mysqlTable('qr_kelas', {
    id: int('id').primaryKey().autoincrement(),
    kelasId: int('kelas_id').unique().notNull().references(() => kelas.id, { onDelete: 'cascade' }),
    tokenQr: varchar('token_qr', { length: 255 }).unique().notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// 5. ABSEN GURU
export const absenGuru = mysqlTable('absen_guru', {
    id: int('id').primaryKey().autoincrement(),
    guruId: int('guru_id').notNull().references(() => users.id),
    kelasId: int('kelas_id').notNull().references(() => kelas.id),
    tanggal: date('tanggal').notNull(),
    waktuScan: timestamp('waktu_scan').defaultNow().notNull(),
    status: mysqlEnum('status', ['hadir', 'terlambat']).notNull(),
}, (table) => ({
    unq: uniqueIndex('unique_absen_guru').on(table.guruId, table.kelasId, table.tanggal),
}));

// 6. ABSEN SISWA
export const absenSiswa = mysqlTable('absen_siswa', {
    id: int('id').primaryKey().autoincrement(),
    siswaId: int('siswa_id').notNull().references(() => siswa.id, { onDelete: 'cascade' }),
    kelasId: int('kelas_id').notNull().references(() => kelas.id, { onDelete: 'cascade' }),
    tanggal: date('tanggal').notNull(),
    status: mysqlEnum('status', ['hadir', 'izin', 'sakit', 'alfa', 'terlambat']).notNull(),
    keterangan: varchar('keterangan', { length: 255 }),
    recordedBy: int('recorded_by').notNull().references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    unq: uniqueIndex('unique_absen_siswa').on(table.siswaId, table.tanggal),
}));

// MAPEL
export const mapel = mysqlTable("mapel", {
    id: int("id").primaryKey().autoincrement(),
    namaMapel: varchar("nama_mapel", { length: 255 }).notNull(),
    kodeMapel: varchar("kode_mapel", { length: 50 }).unique(),
});

// 7. JADWAL MENGAJAR
export const jadwalMengajar = mysqlTable('jadwal_mengajar', {
    id: int('id').primaryKey().autoincrement(),
    guruId: int('guru_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    kelasId: int('kelas_id').notNull().references(() => kelas.id, { onDelete: 'cascade' }),
    mapelId: int('mapel_id').notNull().references(() => mapel.id),
    hari: mysqlEnum('hari', ['senin', 'selasa', 'rabu', 'kamis', 'jumat']).notNull(),
    jamMulai: time('jam_mulai').notNull(),
    jamSelesai: time('jam_selesai').notNull(),
});

// 8. JADWAL PIKET
export const jadwalPiket = mysqlTable('jadwal_piket', {
    id: int('id').primaryKey().autoincrement(),
    guruId: int('guru_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    hari: mysqlEnum('hari', ['senin', 'selasa', 'rabu', 'kamis', 'jumat']).notNull(),
    keterangan: varchar('keterangan', { length: 255 }),
});

// 9. NOTIFIKASi
export const notifications = mysqlTable('notifications', {
    id: int('id').primaryKey().autoincrement(),
    userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    judul: varchar('judul', { length: 255 }).notNull(),
    pesan: text('pesan').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. USER DEVICES
export const userDevices = mysqlTable('user_devices', {
    id: int('id').primaryKey().autoincrement(),
    userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    fcmToken: varchar('fcm_token', { length: 255 }).notNull().unique(),
    lastActive: timestamp('last_active').defaultNow(),
});