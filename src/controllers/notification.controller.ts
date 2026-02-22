import type { Request, Response, NextFunction } from "express";
import * as notifService from "../services/notification.service.js";
import { sendSuccess, sendOk } from "../utils/response.js";

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await notifService.getNotifications(req.user!.id);
        sendSuccess(res, data);
    } catch (err) { next(err); }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await notifService.markAsRead(Number(req.params.id), req.user!.id);
        sendOk(res, "Notifikasi ditandai sudah dibaca");
    } catch (err) { next(err); }
};
