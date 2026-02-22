import { db } from "../db/index.js";
import { absenSiswa, absenGuru, siswa, kelas, users } from "../db/schema.js";
import { eq, and, count, sql, desc, gte } from "drizzle-orm";

export const getStatistikHariIni = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalAlfa] = await db
        .select({ count: count() })
        .from(absenSiswa)
        .where(and(eq(absenSiswa.status, "alfa"), eq(absenSiswa.tanggal, today)));

    const [kelasBermasalah] = await db
        .select({ count: count(sql`DISTINCT ${absenSiswa.kelasId}`) })
        .from(absenSiswa)
        .where(and(eq(absenSiswa.status, "alfa"), eq(absenSiswa.tanggal, today)));

    const [totalTerlambat] = await db
        .select({ count: count() })
        .from(absenSiswa)
        .where(and(eq(absenSiswa.status, "terlambat"), eq(absenSiswa.tanggal, today)));

    return {
        totalAlfa: totalAlfa.count,
        totalKelasBermasalah: kelasBermasalah.count,
        totalTerlambat: totalTerlambat.count,
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
