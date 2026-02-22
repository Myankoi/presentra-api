import { Router } from "express";
import {
    // Guru / Pengguna
    getAllPengguna, createGuru, updateGuru, deleteGuru,
    // Kelas
    getAllKelas, createKelas, updateKelas, deleteKelas,
    // Siswa
    getAllSiswa, createSiswa, updateSiswa, deleteSiswa,
    // Mapel
    getAllMapel, createMapel, updateMapel, deleteMapel,
    // Jadwal Mengajar
    listJadwalMengajar, createJadwalMengajar, deleteJadwalMengajar,
    // Jadwal Piket
    listJadwalPiket, createJadwalPiket, deleteJadwalPiket,
} from "../controllers/admin.controller.js";
import { getQrKelas, regenerateQrKelas } from "../controllers/qr.controller.js";
import { authMiddleware, roleMiddleware } from "../middlewares/index.js";

const router = Router();

// Semua route admin dibatasi oleh role admin
router.use(authMiddleware, roleMiddleware(["admin"]));

// --- PENGGUNA / GURU ---
router.get("/pengguna", getAllPengguna);
router.post("/pengguna", createGuru);
router.put("/pengguna/:id", updateGuru);
router.delete("/pengguna/:id", deleteGuru);

// --- KELAS ---
router.get("/kelas", getAllKelas);
router.post("/kelas", createKelas);
router.put("/kelas/:id", updateKelas);
router.delete("/kelas/:id", deleteKelas);

// --- QR CODE KELAS (harus di bawah /kelas agar tidak bentrok) ---
router.get("/kelas/:id/qr", getQrKelas);
router.post("/kelas/:id/qr/regenerate", regenerateQrKelas);

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
router.get("/jadwal-mengajar", listJadwalMengajar);
router.post("/jadwal-mengajar", createJadwalMengajar);
router.delete("/jadwal-mengajar/:id", deleteJadwalMengajar);

// --- JADWAL PIKET ---
router.get("/jadwal-piket", listJadwalPiket);
router.post("/jadwal-piket", createJadwalPiket);
router.delete("/jadwal-piket/:id", deleteJadwalPiket);

export default router;
