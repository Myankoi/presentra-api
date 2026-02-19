import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { jadwalMengajar, kelas, mapel } from "../db/schema.js";
import { eq, asc, and } from "drizzle-orm";

export const getJadwalGuru = async (req: Request, res: Response, next: NextFunction) => {
    const guruId = req.user?.id;

    // 1. Ambil filter hari dari query param (contoh: ?hari=senin)
    const { hari } = req.query;

    // 2. Logic Default: Jika tidak ada filter, tentukan hari ini dalam format kecil
    const hariIni = new Intl.DateTimeFormat('id-ID', { weekday: 'long' })
        .format(new Date())
        .toLowerCase();

    // Gunakan hari dari query jika ada, jika tidak pakai hariIni
    const targetHari = (hari as string)?.toLowerCase() || hariIni;

    try {
        const jadwal = await db
            .select({
                id: jadwalMengajar.id,
                hari: jadwalMengajar.hari,
                namaMapel: mapel.namaMapel,
                jamMulai: jadwalMengajar.jamMulai,
                jamSelesai: jadwalMengajar.jamSelesai,
                namaKelas: kelas.namaKelas,
            })
            .from(jadwalMengajar)
            .innerJoin(kelas, eq(jadwalMengajar.kelasId, kelas.id))
            .innerJoin(mapel, eq(jadwalMengajar.mapelId, mapel.id))
            .where(
                and(
                    eq(jadwalMengajar.guruId, guruId!),
                    eq(jadwalMengajar.hari, targetHari as any)
                )
            )
            .orderBy(asc(jadwalMengajar.jamMulai));

        res.status(200).json({
            success: true,
            message: `Jadwal mengajar hari ${targetHari} berhasil diambil.`,
            data: jadwal
        });
    } catch (error) {
        next(error);
    }
};