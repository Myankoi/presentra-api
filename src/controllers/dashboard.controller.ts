import type { Request, Response, NextFunction } from "express";
import * as dashboardService from "../services/dashboard.service.js";
import { sendSuccess } from "../utils/response.js";

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await dashboardService.getSummary();
        sendSuccess(res, data);
    } catch (err) { next(err); }
};

export const getChartData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const periode = (req.query.periode === "monthly") ? "monthly" : "weekly";
        const data = await dashboardService.getChartData(periode);
        sendSuccess(res, data);
    } catch (err) { next(err); }
};
