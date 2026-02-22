import type { Request, Response, NextFunction } from "express";
import * as adminService from "../services/admin.service.js";
import { sendSuccess, sendCreated, sendOk } from "../utils/response.js";

// ============ GURU / PENGGUNA ============

export const getAllPengguna = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await adminService.getAllPengguna();
        sendSuccess(res, data);
    } catch (err) { next(err); }
};

export const createGuru = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminService.createGuru(req.body);
        sendCreated(res, "Pengguna berhasil ditambahkan");
    } catch (err) { next(err); }
};

export const updateGuru = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminService.updateGuru(Number(req.params.id), req.body);
        sendOk(res, "Data pengguna berhasil diupdate");
    } catch (err) { next(err); }
};

export const deleteGuru = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminService.deleteGuru(Number(req.params.id));
        sendOk(res, "Pengguna berhasil dihapus");
    } catch (err) { next(err); }
};

// ============ KELAS ============

export const getAllKelas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await adminService.getAllKelas();
        sendSuccess(res, data);
    } catch (err) { next(err); }
};

export const createKelas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminService.createKelas(req.body);
        sendCreated(res, "Kelas berhasil dibuat");
    } catch (err) { next(err); }
};

export const updateKelas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminService.updateKelas(Number(req.params.id), req.body);
        sendOk(res, "Kelas berhasil diupdate");
    } catch (err) { next(err); }
};

export const deleteKelas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminService.deleteKelas(Number(req.params.id));
        sendOk(res, "Kelas berhasil dihapus");
    } catch (err) { next(err); }
};

// ============ SISWA ============

export const getAllSiswa = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await adminService.getAllSiswa();
        sendSuccess(res, data);
    } catch (err) { next(err); }
};

export const createSiswa = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminService.createSiswa(req.body);
        sendCreated(res, "Siswa berhasil ditambahkan");
    } catch (err) { next(err); }
};

export const updateSiswa = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminService.updateSiswa(Number(req.params.id), req.body);
        sendOk(res, "Data siswa berhasil diupdate");
    } catch (err) { next(err); }
};

export const deleteSiswa = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminService.deleteSiswa(Number(req.params.id));
        sendOk(res, "Siswa berhasil dihapus");
    } catch (err) { next(err); }
};

// ============ MAPEL ============

export const getAllMapel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await adminService.getAllMapel();
        sendSuccess(res, data);
    } catch (err) { next(err); }
};

export const createMapel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminService.createMapel(req.body);
        sendCreated(res, "Mata pelajaran berhasil ditambahkan");
    } catch (err) { next(err); }
};

export const updateMapel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminService.updateMapel(Number(req.params.id), req.body);
        sendOk(res, "Mata pelajaran berhasil diupdate");
    } catch (err) { next(err); }
};

export const deleteMapel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminService.deleteMapel(Number(req.params.id));
        sendOk(res, "Mata pelajaran berhasil dihapus");
    } catch (err) { next(err); }
};

// ============ JADWAL MENGAJAR ============

export const listJadwalMengajar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await adminService.listJadwalMengajar();
        sendSuccess(res, data);
    } catch (err) { next(err); }
};

export const createJadwalMengajar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminService.createJadwalMengajar(req.body);
        sendCreated(res, "Jadwal mengajar berhasil dibuat");
    } catch (err) { next(err); }
};

export const deleteJadwalMengajar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminService.deleteJadwalMengajar(Number(req.params.id));
        sendOk(res, "Jadwal mengajar berhasil dihapus");
    } catch (err) { next(err); }
};

// ============ JADWAL PIKET ============

export const listJadwalPiket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await adminService.listJadwalPiket();
        sendSuccess(res, data);
    } catch (err) { next(err); }
};

export const createJadwalPiket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminService.createJadwalPiket(req.body);
        sendCreated(res, "Jadwal piket berhasil dibuat");
    } catch (err) { next(err); }
};

export const deleteJadwalPiket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminService.deleteJadwalPiket(Number(req.params.id));
        sendOk(res, "Jadwal piket berhasil dihapus");
    } catch (err) { next(err); }
};
