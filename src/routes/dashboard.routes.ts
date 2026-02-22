import { Router } from "express";
import { getSummary, getChartData } from "../controllers/dashboard.controller.js";
import { authMiddleware, roleMiddleware } from "../middlewares/index.js";

const router = Router();

// Dashboard bisa diakses admin dan bk
router.get("/summary", authMiddleware, roleMiddleware(["admin", "bk"]), getSummary);
router.get("/chart", authMiddleware, roleMiddleware(["admin", "bk"]), getChartData);

export default router;
