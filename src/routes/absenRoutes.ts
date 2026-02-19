import { Router } from "express";
import { scanAbsenGuru } from "../controllers/absenController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

router.post("/scan-guru", authMiddleware, roleMiddleware(["guru"]), scanAbsenGuru);

export default router;