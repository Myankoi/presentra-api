import type { Request, Response, NextFunction } from "express";
import ExcelJS from "exceljs";
import * as laporanService from "../services/laporan.service.js";
import { sendSuccess } from "../utils/response.js";
import type { LaporanFilters } from "../services/laporan.service.js";

const extractFilters = (query: Request["query"]): LaporanFilters => ({
    startDate: query.startDate as string | undefined,
    endDate: query.endDate as string | undefined,
    bulan: query.bulan as string | undefined,
    tahun: query.tahun as string | undefined,
    kelasId: query.kelasId as string | undefined,
});

// GET /api/laporan/rekap → Preview JSON (untuk UI tabel)
export const getRekap = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters = extractFilters(req.query);
        const data = await laporanService.getRekapData(filters);
        sendSuccess(res, data);
    } catch (err) { next(err); }
};

// GET /api/laporan/export → Download Excel
export const exportLaporanExcel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters = extractFilters(req.query);
        const dataRekap = await laporanService.getRekapData(filters);

        const groupedData: Record<string, typeof dataRekap> = {};
        dataRekap.forEach(row => {
            if (!groupedData[row.namaKelas]) groupedData[row.namaKelas] = [];
            groupedData[row.namaKelas].push(row);
        });

        const workbook = new ExcelJS.Workbook();

        let teksPeriode = "Semua Waktu";
        if (filters.startDate && filters.endDate) teksPeriode = `${filters.startDate} s/d ${filters.endDate}`;
        else if (filters.bulan && filters.tahun) teksPeriode = `Bulan ${filters.bulan} Tahun ${filters.tahun}`;

        if (Object.keys(groupedData).length === 0) {
            const emptySheet = workbook.addWorksheet("Data Kosong");
            emptySheet.getCell("A1").value = "Tidak ada data absensi untuk periode/kelas ini.";
        }

        for (const [namaKelas, listSiswa] of Object.entries(groupedData)) {
            const safeSheetName = namaKelas.substring(0, 31).replace(/[?*:/\\[\]]/g, "");
            const worksheet = workbook.addWorksheet(safeSheetName, { views: [{ state: "frozen", ySplit: 4 }] });

            worksheet.mergeCells("A1:H2");
            const titleCell = worksheet.getCell("A1");
            titleCell.value = `LAPORAN REKAPITULASI ABSENSI SISWA\nKelas: ${namaKelas} | Periode: ${teksPeriode}`;
            titleCell.font = { size: 13, bold: true };
            titleCell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };

            worksheet.columns = [
                { key: "nis", width: 15 },
                { key: "nama", width: 35 },
                { key: "namaKelas", width: 15 },
                { key: "hadir", width: 12 },
                { key: "izin", width: 12 },
                { key: "sakit", width: 12 },
                { key: "alfa", width: 12 },
                { key: "terlambat", width: 12 },
            ];

            const headerRow = worksheet.getRow(4);
            headerRow.values = ["NIS", "Nama Siswa", "Kelas", "Hadir", "Izin", "Sakit", "Alfa", "Terlambat"];
            headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
            headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F81BD" } };
            headerRow.alignment = { horizontal: "center" };

            listSiswa.forEach(row => {
                worksheet.addRow([row.nis, row.nama, row.namaKelas, row.hadir, row.izin, row.sakit, row.alfa, row.terlambat]);
            });

            worksheet.autoFilter = "A4:H4";
        }

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=Laporan_Absensi_Presentra.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) { next(err); }
};