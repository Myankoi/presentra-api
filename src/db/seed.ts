import { db } from "./index.js";
import { users, siswa, kelas } from "./schema.js";

async function main() {
    console.log("Start seeding...");

    console.log("Inserting classes...");
    const [kelasRPL1] = await db.insert(kelas).values({
        namaKelas: "XI RPL 1",
        tahunAjaran: "2025/2026",
    }).$returningId();

    const [kelasRPL2] = await db.insert(kelas).values({
        namaKelas: "XI RPL 2",
        tahunAjaran: "2025/2026",
    }).$returningId();

    console.log("Inserting students...");
    const [siswaSekretaris] = await db.insert(siswa).values({
        nis: "12345678",
        nama: "Miralti",
        jenisKelamin: "P",
        kelasId: kelasRPL1.id,
    }).$returningId();

    console.log("Inserting users...");
    await db.insert(users).values([
        {
            nama: "Eva Yepriliyanti",
            email: "eva.yepriliyanti@yahoo.com",
            firebaseUid: "FIREBASE_ADMIN_UID_DUMMY",
            role: "admin",
        },
        {
            nama: "Rian Pioriandana",
            email: "rian.pioriandana@gmail.com",
            firebaseUid: "FIREBASE_GURU_UID_DUMMY",
            role: "guru",
        },
        {
            nama: "Miralti",
            email: "miralti@gmail.com",
            firebaseUid: "FIREBASE_SISWA_UID_DUMMY",
            role: "sekretaris",
            linkedSiswaId: siswaSekretaris.id,
        }
    ]);

    console.log("✅ Seeding finished successfully!");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Seeding failed:");
    console.error(err);
    process.exit(1);
});