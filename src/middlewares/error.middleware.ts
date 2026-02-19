import type { Request, Response, NextFunction } from "express";

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Internal Error:", err);

    // Cek error spesifik MySQL dari Drizzle
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
            success: false,
            message: "Data sudah ada (Duplikat).",
        });
    }

    // Error default
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Terjadi kesalahan pada server.",
    });
};