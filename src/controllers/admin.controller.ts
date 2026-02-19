import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { kelas, siswa, mapel, jadwalMengajar, jadwalPiket } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";

// --- KELAS ---
export const getAllKelas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await db.select().from(kelas).orderBy(desc(kelas.createdAt));
        res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
};

export const createKelas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await db.insert(kelas).values(req.body);
        res.status(201).json({ success: true, message: "Kelas berhasil dibuat" });
    } catch (error) { next(error); }
};

export const updateKelas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await db.update(kelas).set(req.body).where(eq(kelas.id, Number(id)));
        res.status(200).json({ success: true, message: "Kelas berhasil diupdate" });
    } catch (error) { next(error); }
};

export const deleteKelas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await db.delete(kelas).where(eq(kelas.id, Number(id)));
        res.status(200).json({ success: true, message: "Kelas berhasil dihapus" });
    } catch (error) { next(error); }
};

// --- SISWA ---
export const getAllSiswa = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await db.select().from(siswa).orderBy(siswa.nama);
        res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
};

export const createSiswa = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await db.insert(siswa).values(req.body);
        res.status(201).json({ success: true, message: "Siswa berhasil ditambahkan" });
    } catch (error) { next(error); }
};

export const updateSiswa = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await db.update(siswa).set(req.body).where(eq(siswa.id, Number(id)));
        res.status(200).json({ success: true, message: "Data siswa berhasil diupdate" });
    } catch (error) { next(error); }
};

export const deleteSiswa = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await db.delete(siswa).where(eq(siswa.id, Number(id)));
        res.status(200).json({ success: true, message: "Siswa berhasil dihapus" });
    } catch (error) { next(error); }
};

// --- MAPEL ---
export const getAllMapel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await db.select().from(mapel).orderBy(mapel.namaMapel);
        res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
};

export const createMapel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await db.insert(mapel).values(req.body);
        res.status(201).json({ success: true, message: "Mapel berhasil ditambahkan" });
    } catch (error) { next(error); }
};

export const updateMapel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await db.update(mapel).set(req.body).where(eq(mapel.id, Number(id)));
        res.status(200).json({ success: true, message: "Mapel berhasil diupdate" });
    } catch (error) { next(error); }
};

export const deleteMapel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await db.delete(mapel).where(eq(mapel.id, Number(id)));
        res.status(200).json({ success: true, message: "Mapel berhasil dihapus" });
    } catch (error) { next(error); }
};

// --- JADWAL MENGAJAR ---
export const createJadwalMengajar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await db.insert(jadwalMengajar).values(req.body);
        res.status(201).json({ success: true, message: "Jadwal mengajar berhasil dibuat" });
    } catch (error) { next(error); }
};

export const deleteJadwalMengajar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await db.delete(jadwalMengajar).where(eq(jadwalMengajar.id, Number(id)));
        res.status(200).json({ success: true, message: "Jadwal mengajar berhasil dihapus" });
    } catch (error) { next(error); }
};

// --- JADWAL PIKET ---
export const createJadwalPiket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await db.insert(jadwalPiket).values(req.body);
        res.status(201).json({ success: true, message: "Jadwal piket berhasil dibuat" });
    } catch (error) { next(error); }
};

export const deleteJadwalPiket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await db.delete(jadwalPiket).where(eq(jadwalPiket.id, Number(id)));
        res.status(200).json({ success: true, message: "Jadwal piket berhasil dihapus" });
    } catch (error) { next(error); }
};
