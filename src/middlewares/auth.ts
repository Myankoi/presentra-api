import { auth } from "../config/firebase.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const authMiddleware = async (req: any, res: any, next: any) => {
    // 1. Ambil token dari header "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Akses ditolak. Token tidak ditemukan." });
    }

    const token = authHeader.split(" ")[1];

    try {
        // 2. Verifikasi token ke Firebase Admin SDK
        const decodedToken = await auth.verifyIdToken(token!);
        const uid = decodedToken.uid;

        // 3. Cari user di MySQL berdasarkan firebase_uid
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.firebaseUid, uid))
            .limit(1);

        if (!user) {
            return res.status(404).json({ message: "User belum terdaftar di database sekolah." });
        }

        // 4. Tempel data user ke request biar bisa dipake di controller mana aja
        req.user = user;
        next();
    } catch (error) {
        console.error("Auth Error:", error);
        return res.status(401).json({ message: "Token tidak valid atau sudah kadaluwarsa." });
    }
};