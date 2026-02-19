import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { siswa } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const secretaryScopeMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user; // Data dari authMiddleware

    // 1. Pastikan dia adalah sekretaris dan punya link ke data siswa
    if (user?.role === "sekretaris" && user.linkedSiswaId) {
        try {
            // 2. Cari data siswa untuk mendapatkan kelasId si sekretaris
            const [dataSiswa] = await db
                .select({ kelasId: siswa.kelasId })
                .from(siswa)
                .where(eq(siswa.id, user.linkedSiswaId))
                .limit(1);

            if (!dataSiswa) {
                return res.status(403).json({
                    success: false,
                    message: "Data siswa sekretaris tidak ditemukan di sistem."
                });
            }

            // 3. Kunci kelasId ke dalam request
            req.secretaryKelasId = dataSiswa.kelasId;
            return next();

        } catch (error) {
            return res.status(500).json({ success: false, message: "Gagal memverifikasi lingkup kelas." });
        }
    }

    // Jika bukan sekretaris, tendang!
    return res.status(403).json({
        success: false,
        message: "Akses ditolak. Fitur ini hanya untuk Sekretaris terdaftar."
    });
};