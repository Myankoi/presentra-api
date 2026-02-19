import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { absenSiswa, siswa, kelas } from "../db/schema.js";
import { eq, and, count, sql, desc, gte, lte } from "drizzle-orm";

export const getStatistikHariIni = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Total Siswa Alfa Hari Ini
        const [totalAlfa] = await db
            .select({ count: count() })
            .from(absenSiswa)
            .where(
                and(
                    eq(absenSiswa.status, "alfa"),
                    eq(absenSiswa.tanggal, today)
                )
            );

        // 2. Jumlah Kelas Bermasalah (Kelas yang ada minimal 1 siswa alfa hari ini)
        const [kelasBermasalah] = await db
            .select({ count: count(sql`DISTINCT ${absenSiswa.kelasId}`) })
            .from(absenSiswa)
            .where(
                and(
                    eq(absenSiswa.status, "alfa"),
                    eq(absenSiswa.tanggal, today)
                )
            );

        // 3. (Optional) Total Siswa Terlambat Hari Ini (Buat tambahan info aja)
        const [totalTerlambat] = await db
            .select({ count: count() })
            .from(absenSiswa)
            .where(
                and(
                    eq(absenSiswa.status, "terlambat"),
                    eq(absenSiswa.tanggal, today)
                )
            );

        res.status(200).json({
            success: true,
            data: {
                totalAlfa: totalAlfa.count,
                totalKelasBermasalah: kelasBermasalah.count,
                totalTerlambat: totalTerlambat.count
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getTopAlfa = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Filter: 'minggu' atau 'bulan' (default: bulan)
        const { periode } = req.query;

        const now = new Date();
        const startDate = new Date();

        if (periode === 'minggu') {
            // Set ke awal minggu (Senin)
            const day = startDate.getDay();
            const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
            startDate.setDate(diff);
            startDate.setHours(0, 0, 0, 0);
        } else {
            // Set ke awal bulan
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
        }

        const topSiswa = await db
            .select({
                siswaId: siswa.id,
                nama: siswa.nama,
                namaKelas: kelas.namaKelas,
                nis: siswa.nis,
                totalAlfa: count()
            })
            .from(absenSiswa)
            .innerJoin(siswa, eq(absenSiswa.siswaId, siswa.id))
            .innerJoin(kelas, eq(siswa.kelasId, kelas.id))
            .where(
                and(
                    eq(absenSiswa.status, "alfa"),
                    gte(absenSiswa.tanggal, startDate)
                )
            )
            .groupBy(siswa.id, siswa.nama, kelas.namaKelas, siswa.nis)
            .orderBy(desc(count()))
            .limit(10); // Top 10

        res.status(200).json({
            success: true,
            periode: periode || 'bulan',
            data: topSiswa
        });

    } catch (error) {
        next(error);
    }
};
