import { Router } from "express";
import { syncDevice } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/sync-device", authMiddleware, syncDevice);

export default router;
