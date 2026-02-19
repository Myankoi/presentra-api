import { Router } from "express";
import { exportLaporanExcel } from "../controllers/laporan.controller.js";
import { authMiddleware, roleMiddleware } from "../middlewares/index.js";

const router = Router();

// Endpoint untuk download excel, bisa diakses Admin atau Guru BK
router.get("/export", authMiddleware, roleMiddleware(["admin", "bk", "guru"]), exportLaporanExcel);

export default router;