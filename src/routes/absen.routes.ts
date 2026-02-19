import { Router } from "express";
import { bulkAbsenSiswa, getDailyDetail, getDailyRecap } from "../controllers/absen-siswa.controller.js";
import { getHistoryAbsenGuru, scanAbsenGuru } from "../controllers/absen-guru.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { secretaryScopeMiddleware } from "../middlewares/secretary-scope.middleware.js";

const router = Router();


// GURU
router.post(
    "/guru/scan-guru",
    authMiddleware,
    roleMiddleware(["guru"]),
    scanAbsenGuru
);

router.get(
    "/guru/history",
    authMiddleware,
    roleMiddleware(["guru"]),
    getHistoryAbsenGuru
);

// SEKRETARIS
router.post(
    "/siswa/absen",
    authMiddleware,
    roleMiddleware(["sekretaris"]),
    secretaryScopeMiddleware,
    bulkAbsenSiswa
);

router.get(
    "/siswa/recap",
    authMiddleware,
    roleMiddleware(["sekretaris"]),
    secretaryScopeMiddleware,
    getDailyRecap
);

router.get(
    "/siswa/detail",
    authMiddleware,
    roleMiddleware(["sekretaris"]),
    secretaryScopeMiddleware,
    getDailyDetail
);

export default router;