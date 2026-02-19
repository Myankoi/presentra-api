import { Router } from "express";
import { getJadwalGuru } from "../controllers/jadwal.controller.js";
import { authMiddleware, roleMiddleware } from "../middlewares/index.js";

const router = Router();

router.get("/hari-ini", authMiddleware, roleMiddleware(["guru"]), getJadwalGuru);

export default router;