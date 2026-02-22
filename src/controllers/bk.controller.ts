import type { Request, Response, NextFunction } from "express";
import * as bkService from "../services/bk.service.js";
import { sendSuccess } from "../utils/response.js";

export const getStatistikHariIni = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await bkService.getStatistikHariIni();
        sendSuccess(res, data);
    } catch (err) { next(err); }
};

export const getTopAlfa = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const periode = req.query.periode as string | undefined;
        const data = await bkService.getTopAlfa(periode);
        sendSuccess(res, { periode: periode || "bulan", topAlfa: data });
    } catch (err) { next(err); }
};
