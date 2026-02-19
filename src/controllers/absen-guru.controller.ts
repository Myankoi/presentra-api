import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { qrKelas, absenGuru } from "../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { kelas } from "../db/schema.js";

export const scanAbsenGuru = async (req: Request, res: Response, next: NextFunction) => {
    const { tokenQr } = req.body;
    const guruId = req.user?.id; // Diambil dari auth.middleware

    if (!tokenQr) {
        return res.status(400).json({ success: false, message: "Token QR wajib diisi." });
    }

    try {
        // 1. Cari & Validasi QR Code apakah aktif dan milik kelas mana
        const [dataQr] = await db
            .select()
            .from(qrKelas)
            .where(and(eq(qrKelas.tokenQr, tokenQr), eq(qrKelas.isActive, true)))
            .limit(1);

        if (!dataQr) {
            return res.status(404).json({
                success: false,
                message: "QR Code tidak valid atau sudah kadaluwarsa."
            });
        }

        // 2. Insert data absen guru
        await db.insert(absenGuru).values({
            guruId: guruId!,
            kelasId: dataQr.kelasId,
            tanggal: new Date(), // Menggunakan objek Date sesuai schema
            status: "hadir",
        });

        res.status(201).json({
            success: true,
            message: "Absensi berhasil! Selamat mengajar.",
            data: {
                kelasId: dataQr.kelasId,
                waktu: new Date()
            }
        });

    } catch (error: any) {
        // Handled by error.middleware.ts jika terjadi ER_DUP_ENTRY
        next(error);
    }
};

export const getHistoryAbsenGuru = async (req: Request, res: Response, next: NextFunction) => {
    const guruId = req.user?.id; // Diambil dari token yang sudah diverifikasi

    try {
        // Query mengambil riwayat absen dan join dengan data kelas
        const history = await db
            .select({
                id: absenGuru.id,
                tanggal: absenGuru.tanggal,
                waktuScan: absenGuru.waktuScan,
                status: absenGuru.status,
                namaKelas: kelas.namaKelas,
                tahunAjaran: kelas.tahunAjaran,
            })
            .from(absenGuru)
            .innerJoin(kelas, eq(absenGuru.kelasId, kelas.id)) // Join berdasarkan ID Kelas
            .where(eq(absenGuru.guruId, guruId!))
            .orderBy(desc(absenGuru.waktuScan)); // Urutkan dari yang paling baru

        res.status(200).json({
            success: true,
            message: "Riwayat absensi guru berhasil diambil",
            data: history,
        });
    } catch (error) {
        next(error);
    }
};