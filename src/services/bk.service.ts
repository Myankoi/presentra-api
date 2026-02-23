import { db } from "../db/index.js";
import { absenSiswa, absenGuru, siswa, kelas, users } from "../db/schema.js";
import { eq, count, desc, gte, and } from "drizzle-orm";

export const getStatistikHariIni = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count each status for today
    const results = await db
        .select({
            status: absenSiswa.status,
            count: count(),
        })
        .from(absenSiswa)
        .where(eq(absenSiswa.tanggal, today))
        .groupBy(absenSiswa.status);

    // Total unique students in system
    const [totalRow] = await db
        .select({ count: count() })
        .from(siswa);

    const statusMap = Object.fromEntries(results.map(r => [r.status, r.count]));

    return {
        totalSiswa: totalRow.count,
        hadir: statusMap["hadir"] ?? 0,
        izin: statusMap["izin"] ?? 0,
        sakit: statusMap["sakit"] ?? 0,
        alfa: statusMap["alfa"] ?? 0,
    };
};

export const getTopAlfa = async (periode?: string) => {
    const startDate = new Date();

    if (periode === "minggu") {
        const day = startDate.getDay();
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate.setDate(diff);
    } else {
        startDate.setDate(1);
    }
    startDate.setHours(0, 0, 0, 0);

    return db
        .select({
            siswaId: siswa.id,
            nama: siswa.nama,
            namaKelas: kelas.namaKelas,
            nis: siswa.nis,
            totalAlfa: count(),
        })
        .from(absenSiswa)
        .innerJoin(siswa, eq(absenSiswa.siswaId, siswa.id))
        .innerJoin(kelas, eq(siswa.kelasId, kelas.id))
        .where(and(eq(absenSiswa.status, "alfa"), gte(absenSiswa.tanggal, startDate)))
        .groupBy(siswa.id, siswa.nama, kelas.namaKelas, siswa.nis)
        .orderBy(desc(count()))
        .limit(10);
};
