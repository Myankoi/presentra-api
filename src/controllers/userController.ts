import type { Request, Response } from "express";

export const getMyProfile = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        res.status(200).json({
            success: true,
            message: "Data profil berhasil diambil",
            data: user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};