import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { notifications } from "../db/schema.js";
import { eq, and, desc } from "drizzle-orm";

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;

        const userNotifications = await db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, userId!))
            .orderBy(desc(notifications.createdAt));

        res.status(200).json({
            success: true,
            data: userNotifications
        });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        // Update status isRead = true
        // Pastikan notifikasinya punya user yang lagi login
        await db
            .update(notifications)
            .set({ isRead: true })
            .where(
                and(
                    eq(notifications.id, Number(id)),
                    eq(notifications.userId, userId!)
                )
            );

        res.status(200).json({
            success: true,
            message: "Notifikasi telah ditandai sebagai sudah dibaca."
        });
    } catch (error) {
        next(error);
    }
};
