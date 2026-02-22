import { db } from "../db/index.js";
import { siswa, kelas, absenSiswa } from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";

export type LaporanFilters = {
    startDate?: string;
    endDate?: string;
    bulan?: string;
    tahun?: string;
    kelasId?: string;
};

const buildJoinConditions = (filters: LaporanFilters) => {
    const joinConditions = [eq(siswa.id, absenSiswa.siswaId)];

    if (filters.startDate && filters.endDate) {
        joinConditions.push(
            sql`${absenSiswa.tanggal} >= ${filters.startDate} AND ${absenSiswa.tanggal} <= ${filters.endDate}`
        );
    } else if (filters.bulan && filters.tahun) {
        joinConditions.push(
            sql`MONTH(${absenSiswa.tanggal}) = ${Number(filters.bulan)} AND YEAR(${absenSiswa.tanggal}) = ${Number(filters.tahun)}`
        );
    }

    return joinConditions;
};

export const getRekapData = async (filters: LaporanFilters) => {
    const joinConditions = buildJoinConditions(filters);
    const whereConditions = filters.kelasId ? eq(siswa.kelasId, Number(filters.kelasId)) : undefined;

    return db
        .select({
            nis: siswa.nis,
            nama: siswa.nama,
            namaKelas: kelas.namaKelas,
            hadir: sql<number>`COALESCE(SUM(CASE WHEN ${absenSiswa.status} = 'hadir' THEN 1 ELSE 0 END), 0)`,
            izin: sql<number>`COALESCE(SUM(CASE WHEN ${absenSiswa.status} = 'izin' THEN 1 ELSE 0 END), 0)`,
            sakit: sql<number>`COALESCE(SUM(CASE WHEN ${absenSiswa.status} = 'sakit' THEN 1 ELSE 0 END), 0)`,
            alfa: sql<number>`COALESCE(SUM(CASE WHEN ${absenSiswa.status} = 'alfa' THEN 1 ELSE 0 END), 0)`,
            terlambat: sql<number>`COALESCE(SUM(CASE WHEN ${absenSiswa.status} = 'terlambat' THEN 1 ELSE 0 END), 0)`,
        })
        .from(siswa)
        .innerJoin(kelas, eq(siswa.kelasId, kelas.id))
        .leftJoin(absenSiswa, and(...joinConditions))
        .where(whereConditions)
        .groupBy(siswa.id, kelas.id)
        .orderBy(kelas.namaKelas, siswa.nama);
};
