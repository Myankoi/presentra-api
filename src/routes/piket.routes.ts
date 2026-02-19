import { Router } from "express";
import { getMonitoringPiket, getDetailKelasPiket } from "../controllers/piket.controller.js";
import { authMiddleware, roleMiddleware } from "../middlewares/index.js";

const router = Router();

// Endpoint yang tadi (Dashboard Utama)
router.get("/monitoring", authMiddleware, roleMiddleware(["guru", "admin"]), getMonitoringPiket);

// Endpoint BARU (Detail per Kelas)
router.get("/kelas/:kelasId/detail", authMiddleware, roleMiddleware(["guru", "admin"]), getDetailKelasPiket);

export default router;