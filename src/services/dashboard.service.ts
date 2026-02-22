import { db } from "../db/index.js";
import { users, kelas, siswa, absenSiswa, absenGuru } from "../db/schema.js";
import { eq, and, count, sql, gte, desc } from "drizzle-orm";

export const getSummary = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalSiswa] = await db.select({ count: count() }).from(siswa);
    const [totalGuru] = await db.select({ count: count() }).from(users).where(eq(users.role, "guru"));
    const [totalKelas] = await db.select({ count: count() }).from(kelas);

    const [hadirHariIni] = await db
        .select({ count: count() })
        .from(absenSiswa)
        .where(and(eq(absenSiswa.status, "hadir"), eq(absenSiswa.tanggal, today)));

    const [alfaHariIni] = await db
        .select({ count: count() })
        .from(absenSiswa)
        .where(and(eq(absenSiswa.status, "alfa"), eq(absenSiswa.tanggal, today)));

    const [terlambatHariIni] = await db
        .select({ count: count() })
        .from(absenSiswa)
        .where(and(eq(absenSiswa.status, "terlambat"), eq(absenSiswa.tanggal, today)));

    const [guruHadirHariIni] = await db
        .select({ count: count() })
        .from(absenGuru)
        .where(eq(absenGuru.tanggal, today));

    return {
        totalSiswa: totalSiswa.count,
        totalGuru: totalGuru.count,
        totalKelas: totalKelas.count,
        absensiHariIni: {
            hadir: hadirHariIni.count,
            alfa: alfaHariIni.count,
            terlambat: terlambatHariIni.count,
        },
        guruHadirHariIni: guruHadirHariIni.count,
    };
};

export const getChartData = async (periode: "weekly" | "monthly" = "weekly") => {
    const days = periode === "weekly" ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const rows = await db
        .select({
            tanggal: absenSiswa.tanggal,
            hadir: sql<number>`COALESCE(SUM(CASE WHEN ${absenSiswa.status} = 'hadir' THEN 1 ELSE 0 END), 0)`,
            alfa: sql<number>`COALESCE(SUM(CASE WHEN ${absenSiswa.status} = 'alfa' THEN 1 ELSE 0 END), 0)`,
            izin: sql<number>`COALESCE(SUM(CASE WHEN ${absenSiswa.status} = 'izin' THEN 1 ELSE 0 END), 0)`,
            sakit: sql<number>`COALESCE(SUM(CASE WHEN ${absenSiswa.status} = 'sakit' THEN 1 ELSE 0 END), 0)`,
            terlambat: sql<number>`COALESCE(SUM(CASE WHEN ${absenSiswa.status} = 'terlambat' THEN 1 ELSE 0 END), 0)`,
        })
        .from(absenSiswa)
        .where(gte(absenSiswa.tanggal, startDate))
        .groupBy(absenSiswa.tanggal)
        .orderBy(absenSiswa.tanggal);

    return rows;
};
