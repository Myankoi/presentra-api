import { Router } from "express";
import { syncDevice, changePassword, logout } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/sync-device", authMiddleware, syncDevice);
router.post("/change-password", authMiddleware, changePassword);
router.post("/logout", authMiddleware, logout);

export default router;
