import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { qrKelas, absenGuru } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

export const scanAbsenGuru = async (req: Request, res: Response) => {
    const { tokenQr } = req.body;

    const guruId = Number(req.user!.id);

    try {
        const [dataQr] = await db
            .select()
            .from(qrKelas)
            .where(and(eq(qrKelas.tokenQr, tokenQr), eq(qrKelas.isActive, true)))
            .limit(1);

        if (!dataQr) {
            return res.status(400).json({ message: "QR Code tidak valid." });
        }

        await db.insert(absenGuru).values({
            guruId: guruId,
            kelasId: dataQr.kelasId,
            tanggal: new Date(),
            status: "hadir",
        });

        res.status(201).json({ success: true, message: "Absen berhasil!" });

    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Sudah absen hari ini." });
        }
        res.status(500).json({ message: "Gagal", error: error.message });
    }
};