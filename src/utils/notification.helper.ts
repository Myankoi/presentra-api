import admin from "firebase-admin";
import { db } from "../db/index.js";
import { userDevices, notifications } from "../db/schema.js";
import { eq, inArray } from "drizzle-orm";

export const sendNotification = async (userIds: number[], title: string, body: string) => {
    try {
        // 1. Ambil semua FCM Token milik user-user tersebut
        const devices = await db
            .select({ token: userDevices.fcmToken, userId: userDevices.userId })
            .from(userDevices)
            .where(inArray(userDevices.userId, userIds));

        if (devices.length === 0) return;

        const tokens = devices.map(d => d.token);

        // 2. Kirim via Firebase Cloud Messaging
        const message = {
            notification: { title, body },
            tokens: tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        // 3. Simpan riwayat ke tabel notifications
        const historyData = userIds.map(id => ({
            userId: id,
            judul: title,
            pesan: body,
        }));
        await db.insert(notifications).values(historyData);

        return response;
    } catch (error) {
        console.error("Gagal mengirim notifikasi:", error);
    }
};