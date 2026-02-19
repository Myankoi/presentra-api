import type { Request, Response, NextFunction } from "express";

export const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Data user tidak ditemukan di database sekolah",
            });
        }

        res.status(200).json({
            success: true,
            message: "Data profil berhasil diambil",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};