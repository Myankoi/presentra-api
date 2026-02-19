import { Router } from "express";
import { scanAbsenGuru } from "../controllers/absenController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { roleMiddleware } from "../middlewares/role.js";

const router = Router();

router.post("/scan-guru", authMiddleware, roleMiddleware(["guru"]), scanAbsenGuru);

export default router;