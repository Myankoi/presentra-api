import { db } from "../db/index.js";
import { notifications } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { AppError } from "../types/index.js";

export const getNotifications = async (userId: number) => {
    return db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
};

export const markAsRead = async (notifId: number, userId: number) => {
    const [notif] = await db
        .select({ id: notifications.id, userId: notifications.userId })
        .from(notifications)
        .where(eq(notifications.id, notifId))
        .limit(1);

    if (!notif) throw new AppError("Notifikasi tidak ditemukan", 404);
    if (notif.userId !== userId) throw new AppError("Akses ditolak", 403);

    await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, notifId));
};
