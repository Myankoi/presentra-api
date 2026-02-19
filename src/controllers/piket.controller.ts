import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { kelas, siswa, absenSiswa, jadwalMengajar, mapel, users } from "../db/schema.js";
import { eq, sql, and } from "drizzle-orm";

export const getMonitoringPiket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Query dewa: Ngambil daftar kelas, ngitung total siswa, 
        // dan ngitung siswa yang udah diabsen HARI INI dalam satu jalan.
        const dataKelas = await db
            .select({
                kelasId: kelas.id,
                namaKelas: kelas.namaKelas,
                // Hitung total siswa di kelas tersebut
                totalSiswa: sql<number>`COUNT(DISTINCT ${siswa.id})`,
                // Hitung siswa yang absennya tercatat pada tanggal hari ini
                terabsen: sql<number>`
                    COUNT(DISTINCT CASE 
                        WHEN ${absenSiswa.tanggal} = CURRENT_DATE() 
                        THEN ${absenSiswa.siswaId} 
                        ELSE NULL 
                    END)
                `
            })
            .from(kelas)
            .leftJoin(siswa, eq(kelas.id, siswa.kelasId))
            .leftJoin(absenSiswa, eq(siswa.id, absenSiswa.siswaId))
            .groupBy(kelas.id);

        let selesaiCount = 0;
        let belumCount = 0;

        // Rapihkan datanya buat dikonsumsi Flutter
        const listKelas = dataKelas.map(k => {
            // Status simpel: Kalau ada yang diabsen > 0, berarti sekretaris udah gerak = Selesai.
            const isSelesai = k.terabsen > 0;

            if (isSelesai) selesaiCount++;
            else belumCount++;

            return {
                kelasId: k.kelasId,
                namaKelas: k.namaKelas,
                status: isSelesai ? "Selesai" : "Belum",
                progress: `${k.terabsen}/${k.totalSiswa}`,
                persentase: k.totalSiswa === 0 ? 0 : Math.round((k.terabsen / k.totalSiswa) * 100)
            };
        });

        res.status(200).json({
            success: true,
            message: "Data monitoring piket berhasil diambil",
            summary: {
                totalKelas: dataKelas.length,
                selesai: selesaiCount,
                belum: belumCount
            },
            data: listKelas
        });

    } catch (error) {
        next(error);
    }
};

export const getDetailKelasPiket = async (req: Request, res: Response, next: NextFunction) => {
    const { kelasId } = req.params;

    // Dapatkan hari ini dalam bahasa Indonesia (senin, selasa, dst)
    const hariIni = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date()).toLowerCase();

    // Tanggal hari ini untuk pencarian absen
    const tanggalHariIni = new Date();
    tanggalHariIni.setHours(0, 0, 0, 0); // Reset jam agar akurat

    try {
        // 1. Ambil Jadwal Pelajaran di kelas tersebut khusus HARI INI
        const jadwalHariIni = await db
            .select({
                id: jadwalMengajar.id,
                jamMulai: jadwalMengajar.jamMulai,
                jamSelesai: jadwalMengajar.jamSelesai,
                namaMapel: mapel.namaMapel,
                namaGuru: users.nama
            })
            .from(jadwalMengajar)
            .innerJoin(mapel, eq(jadwalMengajar.mapelId, mapel.id))
            .innerJoin(users, eq(jadwalMengajar.guruId, users.id))
            .where(
                and(
                    eq(jadwalMengajar.kelasId, Number(kelasId)),
                    eq(jadwalMengajar.hari, hariIni as any)
                )
            )
            .orderBy(jadwalMengajar.jamMulai);

        // 2. Ambil Daftar Siswa dan Status Absennya HARI INI
        const dataSiswa = await db
            .select({
                siswaId: siswa.id,
                namaSiswa: siswa.nama,
                nis: siswa.nis,
                statusAbsen: absenSiswa.status,
                keterangan: absenSiswa.keterangan
            })
            .from(siswa)
            // Pakai leftJoin agar siswa yang BELUM diabsen tetap muncul (statusnya null)
            .leftJoin(absenSiswa,
                and(
                    eq(siswa.id, absenSiswa.siswaId),
                    eq(absenSiswa.tanggal, tanggalHariIni)
                )
            )
            .where(eq(siswa.kelasId, Number(kelasId)))
            .orderBy(siswa.nama);

        // 3. Hitung Rekapan Cepat (Hadir/Izin/Sakit/Alfa) untuk UI
        const rekap = { hadir: 0, izin: 0, sakit: 0, alfa: 0, belum: 0 };
        dataSiswa.forEach(s => {
            if (s.statusAbsen === "hadir") rekap.hadir++;
            else if (s.statusAbsen === "izin") rekap.izin++;
            else if (s.statusAbsen === "sakit") rekap.sakit++;
            else if (s.statusAbsen === "alfa") rekap.alfa++;
            else rekap.belum++; // Kalau null berarti sekretaris belum klik apa-apa buat anak ini
        });

        res.status(200).json({
            success: true,
            message: "Detail kelas berhasil diambil",
            data: {
                jadwal: jadwalHariIni,
                rekapAbsen: rekap,
                listSiswa: dataSiswa
            }
        });

    } catch (error) {
        next(error);
    }
};