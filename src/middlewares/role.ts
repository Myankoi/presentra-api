import type { Request, Response, NextFunction } from "express";

export const roleMiddleware = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // req.user didapat dari authMiddleware sebelumnya
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Akses ditolak. Fitur ini hanya untuk ${allowedRoles.join(", ")}.`
            });
        }
        next();
    };
};