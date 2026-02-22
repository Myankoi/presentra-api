import type { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service.js";
import { sendSuccess, sendCreated } from "../utils/response.js";

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

        res.status(200).json({
            success: true,
            message: "Data profil berhasil diambil",
            data: user,
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