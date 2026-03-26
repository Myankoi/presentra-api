import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { sql, eq, and, desc } from "drizzle-orm";
import { absenSiswa, jadwalPiket, kelas, siswa } from "../db/schema.js";
import { sendNotification } from "../utils/notification.helper.js";

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


    const jakartaNow = new Date(
        new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
    );

    const tanggalHariIni = jakartaNow;

    if (!Array.isArray(dataAbsensi) || dataAbsensi.length === 0) {
        return res.status(400).json({ message: "Data absensi tidak valid atau kosong." });
    }

    const invalidItems = dataAbsensi.filter((item: any) => !item.siswaId);
    if (invalidItems.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Terdapat ${invalidItems.length} data absensi dengan siswaId kosong. Pastikan semua item memiliki properti 'siswaId'.`
        });
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



        // 1. Cari siapa Guru yang dapet jadwal piket HARI INI
        const targetHari = new Intl.DateTimeFormat('id-ID', { weekday: 'long' })
            .format(tanggalHariIni)
            .toLowerCase();

        const listGuruPiket = await db
            .select({ guruId: jadwalPiket.guruId })
            .from(jadwalPiket)
            .where(eq(jadwalPiket.hari, targetHari as any));

        if (listGuruPiket.length > 0) {
            const guruIds = listGuruPiket.map(g => g.guruId);

            // Ambil nama kelas buat info di notif
            const [infoKelas] = await db
                .select({ nama: kelas.namaKelas })
                .from(kelas)
                .where(eq(kelas.id, secretaryKelasId!))
                .limit(1);

            // 2. Kirim notif HANYA ke Guru Piket
            await sendNotification(
                guruIds,
                "Laporan Absensi Masuk",
                `Kelas ${infoKelas.nama} baru saja mengirim data absen. Silakan pantau jika ada siswa Alfa.`
            );
        }

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
                siswaId: sql<number>`${siswa}.id`,
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

        const rekapAbsen = { hadir: 0, izinSakit: 0, alfa: 0 };
        detail.forEach(s => {
            if (s.status === "hadir") rekapAbsen.hadir++;
            else if (s.status === "izin" || s.status === "sakit") rekapAbsen.izinSakit++;
            else if (s.status === "alfa") rekapAbsen.alfa++;
        });

        res.status(200).json({
            success: true,
            data: detail,
            stats: {
                totalSiswa: detail.length,
                terisi: detail.filter(s => s.status !== null).length,
                rekapAbsen
            }
        });
    } catch (error) {
        next(error);
    }
};

// ============ DAILY SUMMARY (Beranda Sekretaris) ============

export const getDailySummary = async (req: Request, res: Response, next: NextFunction) => {
    const kelasId = req.secretaryKelasId;

    // Tanggal hari ini (WIB)
    const jakartaNow = new Date(
        new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
    );

    try {
        // 1. Hitung total siswa di kelas
        const totalSiswaResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(siswa)
            .where(eq(siswa.kelasId, kelasId!));

        const totalSiswa = totalSiswaResult[0]?.count ?? 0;

        // 2. Ambil rekap absensi hari ini per status
        const rekapResult = await db
            .select({
                hadir: sql<number>`count(case when ${absenSiswa.status} = 'hadir' then 1 end)`,
                izin: sql<number>`count(case when ${absenSiswa.status} = 'izin' then 1 end)`,
                sakit: sql<number>`count(case when ${absenSiswa.status} = 'sakit' then 1 end)`,
                alfa: sql<number>`count(case when ${absenSiswa.status} = 'alfa' then 1 end)`,
                terlambat: sql<number>`count(case when ${absenSiswa.status} = 'terlambat' then 1 end)`,
            })
            .from(absenSiswa)
            .where(
                and(
                    eq(absenSiswa.kelasId, kelasId!),
                    eq(absenSiswa.tanggal, jakartaNow)
                )
            );

        const rekap = rekapResult[0] ?? { hadir: 0, izin: 0, sakit: 0, alfa: 0, terlambat: 0 };
        const terisi = rekap.hadir + rekap.izin + rekap.sakit + rekap.alfa + rekap.terlambat;

        res.status(200).json({
            success: true,
            message: "Summary absensi hari ini berhasil diambil.",
            data: {
                tanggal: jakartaNow.toISOString().split('T')[0],
                totalSiswa,
                terisi,
                belumAbsen: totalSiswa - terisi,
                ...rekap
            }
        });
    } catch (error) {
        next(error);
    }
};  