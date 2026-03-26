import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { userDevices } from "../db/schema.js";
import { sql, eq, and } from "drizzle-orm";
import { auth } from "../config/firebase.js";

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

// ============ CHANGE PASSWORD (via Firebase Reset Email) ============

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const email = req.user?.email;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email user tidak ditemukan."
            });
        }

        // Generate password reset link dan kirim email via Firebase
        const resetLink = await auth.generatePasswordResetLink(email);

        res.status(200).json({
            success: true,
            message: "Link reset password telah dikirim ke email Anda.",
            data: { resetLink } // Bisa dipakai Flutter buat buka browser langsung
        });

    } catch (error) {
        next(error);
    }
};

// ============ LOGOUT (Remove FCM Token + Revoke Firebase Session) ============

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const firebaseUid = req.user?.firebaseUid;
        const { fcmToken } = req.body;

        // 1. Hapus FCM token dari user_devices supaya gak dapet push notif lagi
        if (fcmToken) {
            await db
                .delete(userDevices)
                .where(
                    and(
                        eq(userDevices.userId, userId!),
                        eq(userDevices.fcmToken, fcmToken)
                    )
                );
        }

        // 2. Revoke semua refresh token Firebase biar session ke-invalidate
        if (firebaseUid) {
            await auth.revokeRefreshTokens(firebaseUid);
        }

        res.status(200).json({
            success: true,
            message: "Berhasil logout. Device token dihapus dan sesi Firebase di-revoke."
        });

    } catch (error) {
        next(error);
    }
};
