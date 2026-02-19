import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { userDevices } from "../db/schema.js";
import { sql } from "drizzle-orm";

export const syncDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { fcmToken } = req.body;

        if (!fcmToken) {
            return res.status(400).json({
                success: false,
                message: "FCM Token is required."
            });
        }

        // Upsert: Kalau token udah ada (misal dari user lain atau user yg sama), update owner-nya jadi user yg skrg login
        await db
            .insert(userDevices)
            .values({
                userId: userId!,
                fcmToken: fcmToken,
                lastActive: new Date()
            })
            .onDuplicateKeyUpdate({
                set: {
                    userId: sql`values(user_id)`,
                    lastActive: sql`values(last_active)`
                }
            });

        res.status(200).json({
            success: true,
            message: "Device token synced successfully."
        });

    } catch (error) {
        next(error);
    }
};
