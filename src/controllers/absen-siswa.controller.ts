import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { sql, eq, and, desc } from "drizzle-orm";
import { absenSiswa, siswa } from "../db/schema.js";

type UpdateAbsenInput = typeof absenSiswa.$inferInsert;

const isPastDeadline = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Jakarta",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find(p => p.type === "hour")?.value || "0");
    const minute = parseInt(parts.find(p => p.type === "minute")?.value || "0");

    // Batas 07:30 WIB
    if (hour > 7 || (hour === 7 && minute > 30)) {
        return true;
    }
    return false;
};

export const bulkAbsenSiswa = async (req: Request, res: Response) => {

    if (isPastDeadline()) {
        return res.status(403).json({
            success: false,
            message: "Batas waktu absensi telah berakhir (Maksimal 07:30 WIB)."
        });
    }

    // 1. Ambil data dari body (Array of objects)
    const { dataAbsensi } = req.body;
    const secretaryKelasId = req.secretaryKelasId; // Dari secretaryScopeMiddleware
    const adminId = req.user!.id; // ID User yang menginput
    const tanggalHariIni = new Date();

    if (!Array.isArray(dataAbsensi) || dataAbsensi.length === 0) {
        return res.status(400).json({ message: "Data absensi tidak valid atau kosong." });
    }

    try {
        // 2. Mapping data untuk batch insert Drizzle
        const valuesToInsert = dataAbsensi.map((item: any) => ({
            siswaId: item.siswaId,
            kelasId: secretaryKelasId!,
            tanggal: tanggalHariIni,
            status: item.status, // 'hadir', 'izin', 'sakit', 'alfa', 'terlambat'
            keterangan: item.keterangan || null,
            recordedBy: adminId,
        }));

        // 3. Jalankan Bulk Insert dengan Upsert (Update if exists)
        await db.insert(absenSiswa)
            .values(valuesToInsert)
            .onDuplicateKeyUpdate({
                set: {
                    status: sql`values(status)`,
                    keterangan: sql`values(keterangan)`,
                    recordedBy: sql`values(recorded_by)`,
                    updatedAt: new Date()
                }
            });

        res.status(201).json({
            success: true,
            message: `Berhasil mencatat absensi untuk ${dataAbsensi.length} siswa.`
        });

    } catch (error: any) {
        console.error("Bulk Absen Error:", error);
        res.status(500).json({ message: "Gagal memproses absensi massal.", error: error.message });
    }
};

export const bulkUpdateAbsenSiswa = async (req: Request, res: Response, next: NextFunction) => {

    if (isPastDeadline()) {
        return res.status(403).json({
            success: false,
            message: "Batas waktu absensi telah berakhir (Maksimal 07:30 WIB)."
        });
    }

    // Pastikan di Flutter juga ngirim id, siswaId, dan tanggal asal di body
    const { dataUpdate } = req.body;
    const secretaryKelasId = req.secretaryKelasId;
    const adminId = req.user!.id;

    if (!Array.isArray(dataUpdate) || dataUpdate.length === 0) {
        return res.status(400).json({ success: false, message: "Data tidak valid." });
    }

    try {
        const valuesToUpdate = dataUpdate.map((item: UpdateAbsenInput) => ({
            id: Number(item.id), // Wajib buat trigger update
            siswaId: item.siswaId, // Wajib ada buat syarat INSERT Drizzle
            tanggal: new Date(item.tanggal), // Wajib ada buat syarat INSERT Drizzle
            kelasId: secretaryKelasId!,
            status: item.status,
            keterangan: item.keterangan || null,
            recordedBy: adminId,
            updatedAt: new Date()
        }));

        await db.insert(absenSiswa)
            .values(valuesToUpdate)
            .onDuplicateKeyUpdate({
                set: {
                    status: sql`values(status)`,
                    keterangan: sql`values(keterangan)`,
                    recordedBy: sql`values(recorded_by)`,
                    updatedAt: sql`values(updated_at)`
                }
            });

        res.status(200).json({ success: true, message: "Update massal berhasil!" });
    } catch (error) {
        next(error);
    }
};

export const getDailyRecap = async (req: Request, res: Response, next: NextFunction) => {
    const kelasId = req.secretaryKelasId; // Terkunci otomatis

    try {
        const recap = await db
            .select({
                tanggal: absenSiswa.tanggal,
                hadir: sql<number>`count(case when ${absenSiswa.status} = 'hadir' then 1 end)`,
                izinSakit: sql<number>`count(case when ${absenSiswa.status} in ('izin', 'sakit') then 1 end)`,
                alfa: sql<number>`count(case when ${absenSiswa.status} = 'alfa' then 1 end)`,
            })
            .from(absenSiswa)
            .where(eq(absenSiswa.kelasId, kelasId!))
            .groupBy(absenSiswa.tanggal)
            .orderBy(desc(absenSiswa.tanggal));

        res.status(200).json({ success: true, data: recap });
    } catch (error) {
        next(error);
    }
};

export const getDailyDetail = async (req: Request, res: Response, next: NextFunction) => {
    const { tanggal } = req.query; // Kirim format YYYY-MM-DD dari Flutter
    const kelasId = req.secretaryKelasId;

    try {
        // Ambil daftar siswa dan status absennya di tanggal tsb
        const detail = await db
            .select({
                nama: siswa.nama,
                nis: siswa.nis,
                status: absenSiswa.status,
            })
            .from(siswa)
            .leftJoin(
                absenSiswa,
                and(
                    eq(siswa.id, absenSiswa.siswaId),
                    eq(absenSiswa.tanggal, new Date(tanggal as string))
                )
            )
            .where(eq(siswa.kelasId, kelasId!));

        res.status(200).json({
            success: true,
            data: detail,
            stats: {
                totalSiswa: detail.length,
                terisi: detail.filter(s => s.status !== null).length
            }
        });
    } catch (error) {
        next(error);
    }
};  