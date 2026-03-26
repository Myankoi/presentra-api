import type { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
import { db } from "../db/index.js";
import { siswa, kelas, users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { auth } from "../config/firebase.js";

// ============ GET PROFILE ============

export const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Data user tidak ditemukan di database sekolah",
            });
        }

        let extraData = {};
        if (user.role === "sekretaris" && user.linkedSiswaId) {
            const [dataKelas] = await db
                .select({
                    namaKelas: kelas.namaKelas,
                    tahunAjaran: kelas.tahunAjaran
                })
                .from(siswa)
                .innerJoin(kelas, eq(siswa.kelasId, kelas.id))
                .where(eq(siswa.id, user.linkedSiswaId))
                .limit(1);
            
            if (dataKelas) {
                extraData = { kelas: dataKelas };
            }
        }

        res.status(200).json({
            success: true,
            message: "Data profil berhasil diambil",
            data: {
                ...user,
                ...extraData
            },
        });
    } catch (error) {
        next(error);
    }
};

// ============ UPDATE PROFILE ============

export const updateMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const firebaseUid = req.user?.firebaseUid;
        const { nama } = req.body;

        if (!nama || nama.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Nama tidak boleh kosong."
            });
        }

        // 1. Update di database MySQL
        await db
            .update(users)
            .set({ nama: nama.trim() })
            .where(eq(users.id, userId!));

        // 2. Sync displayName ke Firebase Auth
        if (firebaseUid) {
            await auth.updateUser(firebaseUid, { displayName: nama.trim() });
        }

        res.status(200).json({
            success: true,
            message: "Profil berhasil diperbarui.",
            data: { nama: nama.trim() }
        });

    } catch (error) {
        next(error);
    }
};

// ============ SINGLE USER CREATION ============

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { nama, email, role, linkedSiswaId } = req.body;

        const result = await userService.createSingleUser({
            nama,
            email,
            role,
            linkedSiswaId: linkedSiswaId ? Number(linkedSiswaId) : undefined,
        });

        sendCreated(res, "User berhasil dibuat dan disinkronkan dengan Firebase.", result);
    } catch (error) {
        next(error);
    }
};

// ============ BULK IMPORT ============

export const bulkImportUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "File Excel (.xlsx) wajib diunggah. Gunakan field name 'file'.",
            });
        }

        const summary = await userService.bulkImportUsers(req.file.buffer);

        sendSuccess(res, summary, 200, "Bulk import selesai diproses.");
    } catch (error) {
        next(error);
    }
};