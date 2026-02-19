import cron from "node-cron";
import { db } from "../db/index.js";
import { users, siswa, absenSiswa } from "../db/schema.js";
import { eq, and, notExists } from "drizzle-orm";
import { sendNotification } from "../utils/notification.helper.js";

export const initAttendanceReminder = () => {
    // Jadwal: Setiap hari Senin-Sabtu jam 07:15 WIB
    // Format cron: menit jam tgl bln hari-minggu
    cron.schedule("15 7 * * 1-5", async () => {
        console.log("🚀 Menjalankan tugas pengingat absensi...");

        const hariIni = new Date();
        hariIni.setHours(0, 0, 0, 0); // Reset waktu ke awal hari

        try {
            // Cari Sekretaris yang kelasnya belum setor absen sama sekali hari ini
            const lazySecretaries = await db
                .select({
                    userId: users.id,
                    nama: users.nama
                })
                .from(users)
                .innerJoin(siswa, eq(users.linkedSiswaId, siswa.id))
                .where(
                    and(
                        eq(users.role, "sekretaris"),
                        notExists(
                            db.select()
                                .from(absenSiswa)
                                .where(and(
                                    eq(absenSiswa.kelasId, siswa.kelasId),
                                    eq(absenSiswa.tanggal, hariIni)
                                ))
                        )
                    )
                );

            if (lazySecretaries.length > 0) {
                const userIds = lazySecretaries.map(s => s.userId);
                await sendNotification(
                    userIds,
                    "⚠️ Pengingat Absensi",
                    "Waktu tinggal 15 menit lagi! Segera absen teman sekelasmu sebelum jam 07:30 WIB."
                );
            }
        } catch (error) {
            console.error("❌ Gagal menjalankan cron job:", error);
        }
    }, {
        timezone: "Asia/Jakarta" // Memastikan berjalan di WIB
    });
};