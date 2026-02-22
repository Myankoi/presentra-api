import { Router } from "express";
import { getRekap, exportLaporanExcel } from "../controllers/laporan.controller.js";
import { authMiddleware, roleMiddleware } from "../middlewares/index.js";

const router = Router();

const allowedRoles = ["admin", "bk", "guru"];

// Preview rekap data sebagai JSON (untuk tampilan tabel di UI)
router.get("/rekap", authMiddleware, roleMiddleware(allowedRoles), getRekap);

// Download Excel
router.get("/export", authMiddleware, roleMiddleware(allowedRoles), exportLaporanExcel);

export default router;