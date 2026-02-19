import { Router } from "express";
import {
    getAllKelas, createKelas, updateKelas, deleteKelas,
    getAllSiswa, createSiswa, updateSiswa, deleteSiswa,
    getAllMapel, createMapel, updateMapel, deleteMapel,
    createJadwalMengajar, deleteJadwalMengajar,
    createJadwalPiket, deleteJadwalPiket
} from "../controllers/admin.controller.js";
import { authMiddleware, roleMiddleware } from "../middlewares/index.js";

const router = Router();

// Middleware: Hanya Admin yang boleh akses
router.use(authMiddleware, roleMiddleware(["admin"]));

// --- KELAS ---
router.get("/kelas", getAllKelas);
router.post("/kelas", createKelas);
router.put("/kelas/:id", updateKelas);
router.delete("/kelas/:id", deleteKelas);

// --- SISWA ---
router.get("/siswa", getAllSiswa);
router.post("/siswa", createSiswa);
router.put("/siswa/:id", updateSiswa);
router.delete("/siswa/:id", deleteSiswa);

// --- MAPEL ---
router.get("/mapel", getAllMapel);
router.post("/mapel", createMapel);
router.put("/mapel/:id", updateMapel);
router.delete("/mapel/:id", deleteMapel);

// --- JADWAL MENGAJAR ---
router.post("/jadwal-mengajar", createJadwalMengajar);
router.delete("/jadwal-mengajar/:id", deleteJadwalMengajar);

// --- JADWAL PIKET ---
router.post("/jadwal-piket", createJadwalPiket);
router.delete("/jadwal-piket/:id", deleteJadwalPiket);

export default router;
