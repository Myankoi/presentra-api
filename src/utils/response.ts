import type { Response } from "express";

export const sendSuccess = (
    res: Response,
    data: unknown,
    statusCode = 200,
    message?: string
) => {
    const payload: Record<string, unknown> = { success: true, data };
    if (message) payload.message = message;
    return res.status(statusCode).json(payload);
};

export const sendCreated = (res: Response, message: string, data?: unknown) => {
    return res.status(201).json({ success: true, message, data });
};

export const sendOk = (res: Response, message: string) => {
    return res.status(200).json({ success: true, message });
};
