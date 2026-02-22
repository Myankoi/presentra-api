import type { Request, Response, NextFunction } from "express";
import { AppError } from "../types/index.js";

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Internal Error:", err);

    // Operational error yang sengaja di-throw dari service/controller
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    // Error spesifik MySQL dari Drizzle
    if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
            success: false,
            message: "Data sudah ada (Duplikat).",
        });
    }

    // Error default / unexpected
    res.status(500).json({
        success: false,
        message: err.message || "Terjadi kesalahan pada server.",
    });
};