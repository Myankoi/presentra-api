import type { Request, Response, NextFunction } from "express";
import * as qrService from "../services/qr.service.js";
import { sendSuccess, sendOk } from "../utils/response.js";

export const getQrKelas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const kelasId = Number(req.params.id);
        const data = await qrService.getQrByKelasId(kelasId);
        sendSuccess(res, data);
    } catch (err) { next(err); }
};

export const regenerateQrKelas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const kelasId = Number(req.params.id);
        const data = await qrService.regenerateQr(kelasId);
        sendSuccess(res, data, 200, "QR Code berhasil di-regenerate");
    } catch (err) { next(err); }
};
