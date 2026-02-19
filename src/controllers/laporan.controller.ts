import type { Request, Response, NextFunction } from "express";
import ExcelJS from "exceljs";
import { db } from "../db/index.js";
import { siswa, kelas, absenSiswa } from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";

export const exportLaporanExcel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate, bulan, tahun, kelasId } = req.query;

        const joinConditions = [eq(siswa.id, absenSiswa.siswaId)];

        if (startDate && endDate) {
            joinConditions.push(sql`${absenSiswa.tanggal} >= ${startDate} AND ${absenSiswa.tanggal} <= ${endDate}`);
        } else if (bulan && tahun) {
            joinConditions.push(sql`MONTH(${absenSiswa.tanggal}) = ${Number(bulan)} AND YEAR(${absenSiswa.tanggal}) = ${Number(tahun)}`);
        }

        const whereConditions = kelasId ? eq(siswa.kelasId, Number(kelasId)) : undefined;

        // 1. Tarik Data dari Database (Sama seperti sebelumnya)
        const dataRekap = await db
            .select({
                nis: siswa.nis,
                nama: siswa.nama,
                namaKelas: kelas.namaKelas,
                hadir: sql<number>`COALESCE(SUM(CASE WHEN ${absenSiswa.status} = 'hadir' THEN 1 ELSE 0 END), 0)`,
                izin: sql<number>`COALESCE(SUM(CASE WHEN ${absenSiswa.status} = 'izin' THEN 1 ELSE 0 END), 0)`,
                sakit: sql<number>`COALESCE(SUM(CASE WHEN ${absenSiswa.status} = 'sakit' THEN 1 ELSE 0 END), 0)`,
                alfa: sql<number>`COALESCE(SUM(CASE WHEN ${absenSiswa.status} = 'alfa' THEN 1 ELSE 0 END), 0)`,
            })
            .from(siswa)
            .innerJoin(kelas, eq(siswa.kelasId, kelas.id))
            .leftJoin(absenSiswa, and(...joinConditions))
            .where(whereConditions)
            .groupBy(siswa.id, kelas.id)
            .orderBy(kelas.namaKelas, siswa.nama);

        // 2. KELOMPOKKAN DATA BERDASARKAN KELAS
        // Kita bikin object dictionary, kuncinya nama kelas, isinya array siswa di kelas itu
        const groupedData: Record<string, typeof dataRekap> = {};
        dataRekap.forEach(row => {
            if (!groupedData[row.namaKelas]) {
                groupedData[row.namaKelas] = [];
            }
            groupedData[row.namaKelas].push(row);
        });

        const workbook = new ExcelJS.Workbook();

        // Siapkan teks periode untuk judul
        let teksPeriode = "Semua Waktu";
        if (startDate && endDate) teksPeriode = `${startDate} s/d ${endDate}`;
        else if (bulan && tahun) teksPeriode = `Bulan ${bulan} Tahun ${tahun}`;

        // Jaga-jaga kalau filter pencarian datanya kosong (tidak ada murid)
        if (Object.keys(groupedData).length === 0) {
            const emptySheet = workbook.addWorksheet("Data Kosong");
            emptySheet.getCell('A1').value = "Tidak ada data absensi untuk periode/kelas ini.";
        }

        // 3. LOOPING BIKIN SHEET EXCEL UNTUK TIAP KELAS
        for (const [namaKelas, listSiswa] of Object.entries(groupedData)) {
            // Nama sheet Excel maksimal 31 karakter dan ga boleh ada karakter aneh
            const safeSheetName = namaKelas.substring(0, 31).replace(/[?*:\/\\\[\]]/g, '');
            const worksheet = workbook.addWorksheet(safeSheetName, { views: [{ state: 'frozen', ySplit: 4 }] });

            // A. Bikin Judul Laporan di tiap sheet
            worksheet.mergeCells('A1:G2');
            const titleCell = worksheet.getCell('A1');
            titleCell.value = `LAPORAN REKAPITULASI ABSENSI SISWA\nKelas: ${namaKelas} | Periode: ${teksPeriode}`;
            titleCell.font = { size: 13, bold: true };
            titleCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

            // B. Setup Lebar Kolom
            worksheet.columns = [
                { key: "nis", width: 15 },
                { key: "nama", width: 35 },
                { key: "namaKelas", width: 15 },
                { key: "hadir", width: 12 },
                { key: "izin", width: 12 },
                { key: "sakit", width: 12 },
                { key: "alfa", width: 12 },
            ];

            // C. Bikin Header Tabel (Baris ke-4)
            const headerRow = worksheet.getRow(4);
            headerRow.values = ['NIS', 'Nama Siswa', 'Kelas', 'Hadir', 'Izin', 'Sakit', 'Alfa'];
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Tulisan Putih
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } }; // Background Biru
            headerRow.alignment = { horizontal: 'center' };

            // D. Masukkan Data Siswa ke Sheet Kelas Tersebut
            listSiswa.forEach((row) => {
                worksheet.addRow([row.nis, row.nama, row.namaKelas, row.hadir, row.izin, row.sakit, row.alfa]);
            });

            // E. Pasang Auto-Filter
            worksheet.autoFilter = 'A4:G4';
        }

        // 4. KIRIM FILE KE FRONTEND
        const fileName = `Laporan_Absensi_Presentra.xlsx`;
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        next(error);
    }
};