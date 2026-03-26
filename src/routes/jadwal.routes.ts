import { Router } from "express";
import { getJadwalGuru, getJadwalByKelas } from "../controllers/jadwal.controller.js";
import { authMiddleware, roleMiddleware } from "../middlewares/index.js";

const router = Router();

router.get("/hari-ini", authMiddleware, roleMiddleware(["guru"]), getJadwalGuru);
router.get("/kelas/:kelasId", authMiddleware, roleMiddleware(["guru", "admin"]), getJadwalByKelas);

export default router;