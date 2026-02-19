import { Router } from "express";
import { getStatistikHariIni, getTopAlfa } from "../controllers/bk.controller.js";
import { authMiddleware, roleMiddleware } from "../middlewares/index.js";

const router = Router();

router.get("/statistik-hari-ini", authMiddleware, roleMiddleware(["bk", "admin"]), getStatistikHariIni);
router.get("/top-alfa", authMiddleware, roleMiddleware(["bk", "admin"]), getTopAlfa);

export default router;
