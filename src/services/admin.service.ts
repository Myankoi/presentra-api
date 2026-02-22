import { db } from "../db/index.js";
import { users, kelas, siswa, mapel, jadwalMengajar, jadwalPiket } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { AppError } from "../types/index.js";

// ============ GURU / PENGGUNA ============

export const getAllGuru = async () => {
    return db
        .select({
            id: users.id,
            nama: users.nama,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.role, "guru"))
        .orderBy(users.nama);
};

export const getAllPengguna = async () => {
    return db
        .select({
            id: users.id,
            nama: users.nama,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(users.nama);
};

export const createGuru = async (body: {
    nama: string;
    email: string;
    firebaseUid: string;
    role: "guru" | "sekretaris" | "bk" | "admin";
}) => {
    await db.insert(users).values(body);
};

export const updateGuru = async (id: number, body: Partial<{ nama: string; email: string; role: "guru" | "sekretaris" | "bk" | "admin" }>) => {
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
    if (!existing) throw new AppError("Pengguna tidak ditemukan", 404);
    await db.update(users).set(body).where(eq(users.id, id));
};

export const deleteGuru = async (id: number) => {
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
    if (!existing) throw new AppError("Pengguna tidak ditemukan", 404);
    await db.delete(users).where(eq(users.id, id));
};

// ============ KELAS ============

export const getAllKelas = async () => {
    return db.select().from(kelas).orderBy(desc(kelas.createdAt));
};

export const createKelas = async (body: { namaKelas: string; tahunAjaran: string }) => {
    await db.insert(kelas).values(body);
};

export const updateKelas = async (id: number, body: Partial<{ namaKelas: string; tahunAjaran: string }>) => {
    const [existing] = await db.select({ id: kelas.id }).from(kelas).where(eq(kelas.id, id)).limit(1);
    if (!existing) throw new AppError("Kelas tidak ditemukan", 404);
    await db.update(kelas).set(body).where(eq(kelas.id, id));
};

export const deleteKelas = async (id: number) => {
    const [existing] = await db.select({ id: kelas.id }).from(kelas).where(eq(kelas.id, id)).limit(1);
    if (!existing) throw new AppError("Kelas tidak ditemukan", 404);
    await db.delete(kelas).where(eq(kelas.id, id));
};

// ============ SISWA ============

export const getAllSiswa = async () => {
    return db
        .select({
            id: siswa.id,
            nis: siswa.nis,
            nama: siswa.nama,
            jenisKelamin: siswa.jenisKelamin,
            kelasId: siswa.kelasId,
            namaKelas: kelas.namaKelas,
            createdAt: siswa.createdAt,
        })
        .from(siswa)
        .innerJoin(kelas, eq(siswa.kelasId, kelas.id))
        .orderBy(kelas.namaKelas, siswa.nama);
};

export const createSiswa = async (body: { nis?: string; nama: string; jenisKelamin: "L" | "P"; kelasId: number }) => {
    await db.insert(siswa).values(body);
};

export const updateSiswa = async (id: number, body: Partial<{ nis: string; nama: string; jenisKelamin: "L" | "P"; kelasId: number }>) => {
    const [existing] = await db.select({ id: siswa.id }).from(siswa).where(eq(siswa.id, id)).limit(1);
    if (!existing) throw new AppError("Siswa tidak ditemukan", 404);
    await db.update(siswa).set(body).where(eq(siswa.id, id));
};

export const deleteSiswa = async (id: number) => {
    const [existing] = await db.select({ id: siswa.id }).from(siswa).where(eq(siswa.id, id)).limit(1);
    if (!existing) throw new AppError("Siswa tidak ditemukan", 404);
    await db.delete(siswa).where(eq(siswa.id, id));
};

// ============ MAPEL ============

export const getAllMapel = async () => {
    return db.select().from(mapel).orderBy(mapel.namaMapel);
};

export const createMapel = async (body: { namaMapel: string; kodeMapel?: string }) => {
    await db.insert(mapel).values(body);
};

export const updateMapel = async (id: number, body: Partial<{ namaMapel: string; kodeMapel: string }>) => {
    const [existing] = await db.select({ id: mapel.id }).from(mapel).where(eq(mapel.id, id)).limit(1);
    if (!existing) throw new AppError("Mata pelajaran tidak ditemukan", 404);
    await db.update(mapel).set(body).where(eq(mapel.id, id));
};

export const deleteMapel = async (id: number) => {
    const [existing] = await db.select({ id: mapel.id }).from(mapel).where(eq(mapel.id, id)).limit(1);
    if (!existing) throw new AppError("Mata pelajaran tidak ditemukan", 404);
    await db.delete(mapel).where(eq(mapel.id, id));
};

// ============ JADWAL MENGAJAR ============

export const listJadwalMengajar = async () => {
    return db
        .select({
            id: jadwalMengajar.id,
            guruId: jadwalMengajar.guruId,
            namaGuru: users.nama,
            kelasId: jadwalMengajar.kelasId,
            namaKelas: kelas.namaKelas,
            mapelId: jadwalMengajar.mapelId,
            namaMapel: mapel.namaMapel,
            hari: jadwalMengajar.hari,
            jamMulai: jadwalMengajar.jamMulai,
            jamSelesai: jadwalMengajar.jamSelesai,
        })
        .from(jadwalMengajar)
        .innerJoin(users, eq(jadwalMengajar.guruId, users.id))
        .innerJoin(kelas, eq(jadwalMengajar.kelasId, kelas.id))
        .innerJoin(mapel, eq(jadwalMengajar.mapelId, mapel.id))
        .orderBy(jadwalMengajar.hari, jadwalMengajar.jamMulai);
};

export const createJadwalMengajar = async (body: {
    guruId: number;
    kelasId: number;
    mapelId: number;
    hari: "senin" | "selasa" | "rabu" | "kamis" | "jumat";
    jamMulai: string;
    jamSelesai: string;
}) => {
    await db.insert(jadwalMengajar).values(body);
};

export const deleteJadwalMengajar = async (id: number) => {
    const [existing] = await db.select({ id: jadwalMengajar.id }).from(jadwalMengajar).where(eq(jadwalMengajar.id, id)).limit(1);
    if (!existing) throw new AppError("Jadwal mengajar tidak ditemukan", 404);
    await db.delete(jadwalMengajar).where(eq(jadwalMengajar.id, id));
};

// ============ JADWAL PIKET ============

export const listJadwalPiket = async () => {
    return db
        .select({
            id: jadwalPiket.id,
            guruId: jadwalPiket.guruId,
            namaGuru: users.nama,
            hari: jadwalPiket.hari,
            keterangan: jadwalPiket.keterangan,
        })
        .from(jadwalPiket)
        .innerJoin(users, eq(jadwalPiket.guruId, users.id))
        .orderBy(jadwalPiket.hari, users.nama);
};

export const createJadwalPiket = async (body: {
    guruId: number;
    hari: "senin" | "selasa" | "rabu" | "kamis" | "jumat";
    keterangan?: string;
}) => {
    await db.insert(jadwalPiket).values(body);
};

export const deleteJadwalPiket = async (id: number) => {
    const [existing] = await db.select({ id: jadwalPiket.id }).from(jadwalPiket).where(eq(jadwalPiket.id, id)).limit(1);
    if (!existing) throw new AppError("Jadwal piket tidak ditemukan", 404);
    await db.delete(jadwalPiket).where(eq(jadwalPiket.id, id));
};
