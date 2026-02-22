import { randomBytes } from "crypto";
import { db } from "../db/index.js";
import { kelas, qrKelas } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { AppError } from "../types/index.js";

export const getQrByKelasId = async (kelasId: number) => {
    // Validasi kelas exist
    const [kelasData] = await db
        .select({ id: kelas.id, namaKelas: kelas.namaKelas, tahunAjaran: kelas.tahunAjaran })
        .from(kelas)
        .where(eq(kelas.id, kelasId))
        .limit(1);

    if (!kelasData) throw new AppError("Kelas tidak ditemukan", 404);

    // Cek apakah QR sudah ada
    const [existing] = await db
        .select()
        .from(qrKelas)
        .where(eq(qrKelas.kelasId, kelasId))
        .limit(1);

    if (existing) {
        return { kelas: kelasData, qr: existing };
    }

    // Belum ada QR → auto-generate
    const tokenQr = randomBytes(32).toString("hex");
    await db.insert(qrKelas).values({ kelasId, tokenQr, isActive: true });

    const [newQr] = await db
        .select()
        .from(qrKelas)
        .where(eq(qrKelas.kelasId, kelasId))
        .limit(1);

    return { kelas: kelasData, qr: newQr };
};

export const regenerateQr = async (kelasId: number) => {
    const [kelasData] = await db
        .select({ id: kelas.id })
        .from(kelas)
        .where(eq(kelas.id, kelasId))
        .limit(1);

    if (!kelasData) throw new AppError("Kelas tidak ditemukan", 404);

    const newToken = randomBytes(32).toString("hex");

    // Upsert: update jika sudah ada, insert jika belum
    const [existing] = await db
        .select({ id: qrKelas.id })
        .from(qrKelas)
        .where(eq(qrKelas.kelasId, kelasId))
        .limit(1);

    if (existing) {
        await db
            .update(qrKelas)
            .set({ tokenQr: newToken, isActive: true })
            .where(eq(qrKelas.kelasId, kelasId));
    } else {
        await db.insert(qrKelas).values({ kelasId, tokenQr: newToken, isActive: true });
    }

    const [updatedQr] = await db
        .select()
        .from(qrKelas)
        .where(eq(qrKelas.kelasId, kelasId))
        .limit(1);

    return updatedQr;
};
