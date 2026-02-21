import { db } from "./index.js";
import { users, mapel, jadwalMengajar, jadwalPiket, siswa, qrKelas } from "./schema.js";
import { eq } from "drizzle-orm";

async function main() {
    console.log("🚀 Start seeding Mapel & 63 Guru...");

    // const mapelData = [
    //     "PABP", "Bahasa Arab", "Bahasa Perancis", "Mulok",
    //     "Pendidikan Pancasila", "Bahasa Indonesia", "Sejarah",
    //     "PJOK", "Seni Budaya", "Matematika", "Bahasa Inggris",
    //     "IPAS Eksak", "IPAS Sosial", "Informatika",
    //     "DPK", "KK", "PKK", "BK", "Mapel Pilihan"
    // ];

    // const guruData = [
    //     { kode: "AA", nama: "Aan Aspriansyah" },
    //     { kode: "AH", nama: "Ahmad Hilal" },
    //     { kode: "AS", nama: "Ahmad Surya" },
    //     { kode: "AW", nama: "Ana Wijayanti" },
    //     { kode: "A", nama: "Anggik Ika Wahyuningsih" },
    //     { kode: "AG", nama: "Ari Al Ghifari" },
    //     { kode: "AR", nama: "Arina Rahmawati" },
    //     { kode: "BM", nama: "Bunga Mahardika" },
    //     { kode: "C", nama: "Carla" },
    //     { kode: "CH", nama: "Chairul Fajri" },
    //     { kode: "CS", nama: "Christiana Sukmawati" },
    //     { kode: "DH", nama: "Dahlia Sibuea" },
    //     { kode: "DF", nama: "Deandra Faldza A.P" },
    //     { kode: "DH_2", nama: "Dewi Herlina Saragih" },
    //     { kode: "DR", nama: "Dini Rahmawati" },
    //     { kode: "NP", nama: "Nebajot Pilstin Luzikooy" },
    //     { kode: "WD", nama: "Widya Devi" },
    //     { kode: "AJI", nama: "Ajisar" },
    //     { kode: "GW", nama: "Gatot Widodo" },
    //     { kode: "KZ", nama: "Kamaruzzaman" },
    //     { kode: "EN", nama: "Elen Nurdiana" },
    //     { kode: "EI", nama: "Endang Astuti" },
    //     { kode: "ER", nama: "Erni Susilawati" },
    //     { kode: "EA", nama: "Eva Andriyani" },
    //     { kode: "ET", nama: "Eva Yepriliyanti" },
    //     { kode: "EY", nama: "Eva Yulianti" },
    //     { kode: "FD", nama: "Fahmi Dwi Febrianto" },
    //     { kode: "FE", nama: "Fajria Eka Putri" },
    //     { kode: "HD", nama: "Hadi Santoso" },
    //     { kode: "HS", nama: "Heni Setiyarini" },
    //     { kode: "HE", nama: "Eny Elastri" },
    //     { kode: "IW", nama: "Ibnu Widanto" },
    //     { kode: "IT", nama: "Intan Theresia V" },
    //     { kode: "IZ", nama: "Ismiyatun" },
    //     { kode: "KY", nama: "Kameliyanti" },
    //     { kode: "KJ", nama: "Kartina" },
    //     { kode: "KH", nama: "Khairunnisa" },
    //     { kode: "KQ", nama: "Kholifa Qisti Rohimah" },
    //     { kode: "LM", nama: "Leny Marina" },
    //     { kode: "MR", nama: "Mohammad Reza" },
    //     { kode: "NKK", nama: "Ni Komang Kurniawati" },
    //     { kode: "NY", nama: "Novianti P" },
    //     { kode: "NS", nama: "Nur Siti Kundakimah" },
    //     { kode: "AB", nama: "Nurfitria Ambarwati" },
    //     { kode: "NI", nama: "Nurlatifah Ismail" },
    //     { kode: "NK", nama: "Nurul Kamilah" },
    //     { kode: "OM", nama: "Oktaviana" },
    //     { kode: "PM", nama: "Putri Mahar" },
    //     { kode: "RU", nama: "Ratri Putri Utami" },
    //     { kode: "RW", nama: "Retno Widowati" },
    //     { kode: "RP", nama: "Rian Pioriandana" },
    //     { kode: "RA", nama: "Rosyid Abdullah" },
    //     { kode: "SN", nama: "Sulistyorini Nuribrasih" },
    //     { kode: "SUN", nama: "Suniah" },
    //     { kode: "SP", nama: "Supraptiningsih" },
    //     { kode: "SW", nama: "Susy Wahyuni" },
    //     { kode: "TJ", nama: "Tjandra Sari Astuti" },
    //     { kode: "WP", nama: "Waluya Priyatna" },
    //     { kode: "WS", nama: "Wawan Sumarwan" },
    //     { kode: "YS", nama: "Yanti Sabartina" },
    //     { kode: "YZ", nama: "Yariani Zega" },
    //     { kode: "YU", nama: "Yazid Umami" },
    //     { kode: "Z", nama: "Zulfadina" }
    // ];

    // console.log("Menyimpan 63 data Guru ke tabel Users...");
    // for (const g of guruData) {
    //     const emailDummy = `${g.kode.toLowerCase()}@presentra.sch.id`;
    //     const uidDummy = `FIREBASE_UID_${g.kode}`;

    //     await db.insert(users).values({
    //         nama: g.nama,
    //         email: emailDummy,
    //         firebaseUid: uidDummy,
    //         role: "guru",
    //     }).onDuplicateKeyUpdate({ set: { nama: g.nama } });
    // }

    const kelasRPL1 = await db.query.kelas.findFirst({ where: (t, { eq }) => eq(t.namaKelas, "XI RPL 1") });

    if (!kelasRPL1) {
        console.error("❌ Kelas XI RPL 1 tidak ditemukan! Seeding batal.");
        process.exit(1);
    }

    // const getMapelId = async (name: string) => {
    //     let m = await db.query.mapel.findFirst({ where: (t, { eq }) => eq(t.namaMapel, name) });
    //     return m?.id;
    // };

    // const allGurus = await db.query.users.findMany({ where: (t, { eq }) => eq(t.role, "guru") });

    // const findGuruId = (identifier: string) => {
    //     // Try name partial match (e.g. "Eva" -> "Eva Yepriliyanti")
    //     const g = allGurus.find(u => u.nama.toLowerCase().includes(identifier.toLowerCase()));
    //     return g?.id;
    // };

    // const timeMap: Record<number, { start: string, end: string }> = {
    //     1: { start: "06:30", end: "07:15" },
    //     2: { start: "07:15", end: "08:00" },
    //     3: { start: "08:00", end: "08:45" },
    //     4: { start: "08:45", end: "09:30" },
    //     5: { start: "09:40", end: "10:25" },
    //     6: { start: "10:25", end: "11:10" },
    //     7: { start: "11:10", end: "11:55" },
    //     8: { start: "12:45", end: "13:30" },
    //     9: { start: "13:30", end: "14:15" },
    //     10: { start: "14:15", end: "15:00" },
    // };

    // const insertJadwal = async (hari: string, jamList: number[], guruNameKunci: string, mapelName: string) => {
    //     const guruId = findGuruId(guruNameKunci);
    //     if (!guruId) {
    //         console.warn(`⚠️ Guru tidak ditemukan: ${guruNameKunci}`);
    //         return;
    //     }
    //     const mapelId = await getMapelId(mapelName);
    //     if (!mapelId) {
    //         console.warn(`⚠️ Mapel tidak ditemukan: ${mapelName}`);
    //         return;
    //     }
    //     const start = timeMap[jamList[0]].start;
    //     const end = timeMap[jamList[jamList.length - 1]].end;
    //     await db.insert(jadwalMengajar).values({
    //         guruId,
    //         kelasId: kelasRPL1.id,
    //         mapelId,
    //         hari: hari.toLowerCase() as any,
    //         jamMulai: start,
    //         jamSelesai: end
    //     });
    // };

    // await insertJadwal("senin", [2, 3, 4], "Eva Yepriliyanti", "DPK");
    // // 5-8: DPK (PAK AJI) -> Ajisar
    // await insertJadwal("senin", [5, 6, 7, 8], "Ajisar", "DPK");
    // // 9-10: 3D (BU OKTA) -> Oktaviana (Mapel Pilihan)
    // await insertJadwal("senin", [9, 10], "Oktaviana", "Mapel Pilihan");
    // // SELASA
    // // 1-4: DPK (PAK HILAL) -> Ahmad Hilal
    // await insertJadwal("selasa", [1, 2, 3, 4], "Ahmad Hilal", "DPK");
    // // 5-6: OLAHRAGA (PAK GATOT) -> Gatot Widodo
    // await insertJadwal("selasa", [5, 6], "Gatot Widodo", "PJOK"); // Or OLAHRAGA
    // // 7-8: PP (BU ELEN) -> Elen Nurdiana
    // await insertJadwal("selasa", [7, 8], "Elen Nurdiana", "Pendidikan Pancasila");
    // // 9-10: Bahasa Inggris (PAK HADI) -> Hadi Santoso
    // await insertJadwal("selasa", [9, 10], "Hadi Santoso", "Bahasa Inggris");
    // // RABU
    // // 1-2: KEGIATAN RABU (Skip)
    // // 3-7: PKKWU (BU EVA)
    // await insertJadwal("rabu", [3, 4, 5, 6, 7], "Eva Yepriliyanti", "PKK"); // PKKWU = PKK
    // // 8-10: MTK (BU YANTI) -> Yanti Sabartina
    // await insertJadwal("rabu", [8, 9, 10], "Yanti Sabartina", "Matematika");
    // // KAMIS
    // // 1-4: DPK (PAK HILAL)
    // await insertJadwal("kamis", [1, 2, 3, 4], "Ahmad Hilal", "DPK");
    // // 5-7: AGAMA (PAK ROSYID) -> Rosyid Abdullah
    // await insertJadwal("kamis", [5, 6, 7], "Rosyid Abdullah", "PABP");
    // // 8: BK (BU HENI) -> Heni Setiyarini
    // await insertJadwal("kamis", [8], "Heni Setiyarini", "BK");
    // // 9-10: B.ARAB (PAK SURYA) -> Ahmad Surya
    // await insertJadwal("kamis", [9, 10], "Ahmad Surya", "Bahasa Arab");
    // // JUMAT
    // // 1-2: B.INGGRIS (PAK HADI) -> Hadi Santoso
    // await insertJadwal("jumat", [1, 2], "Hadi Santoso", "Bahasa Inggris");
    // // 3-4: SEJARAH (BU ISMI) -> Ismiyatun
    // await insertJadwal("jumat", [3, 4], "Ismiyatun", "Sejarah"); // Override from B.Indo
    // // 5-7: B.INDONESIA (BU EVA) -> Eva Yepriliyanti
    // await insertJadwal("jumat", [5, 6, 7], "Eva Yepriliyanti", "Bahasa Indonesia");
    // // 8-10: DPK (BU NOVI) -> Novianti P
    // await insertJadwal("jumat", [8, 9, 10], "Novianti P", "DPK");
    // console.log("✅ Jadwal XI RPL 1 Selesai!");
    // // --- 6. SEEDING JADWAL PIKET (4 ORANG/HARI, TIDAK BOLEH DOBEL DLM SEMINGGU) ---
    // console.log("Menyimpan Jadwal Piket (20 Guru Unik)...");
    // const days = ["senin", "selasa", "rabu", "kamis", "jumat"];

    // // Shuffle guru IDs
    // const shuffledGuruIds = allGurus.map(g => g.id).sort(() => 0.5 - Math.random());

    // // Pastikan cukup gurunya (63 cukup buat 20 slot)
    // let gIdx = 0;
    // for (const day of days) {
    //     for (let i = 0; i < 4; i++) { // 4 Guru per hari
    //         if (gIdx >= shuffledGuruIds.length) gIdx = 0; // Rotasi kalau habis (seharusnya enggak)

    //         await db.insert(jadwalPiket).values({
    //             guruId: shuffledGuruIds[gIdx],
    //             hari: day as any,
    //             keterangan: "Piket area Gedung B"
    //         });
    //         gIdx++;
    //     }
    // }


    // console.log("✅ 63 Guru berhasil disimpan!");

    // --- 7. SEEDING SISWA XI RPL 1 (EXCEPT #22) ---


    //     console.log("Menyimpan Data Siswa XI RPL 1...");

    // const siswaDataRaw = [
    //     { nama: "Achmad Fachri Hidayat", jk: "L" },
    //     { nama: "Adya Syifa Ainiah", jk: "P" },
    //     { nama: "Afifah Ayuningtias", jk: "P" },
    //     { nama: "Ahmad Ihsan Muzakki", jk: "L" },
    //     { nama: "Ahmad Kamal Angkasa", jk: "L" },
    //     { nama: "Amalia Utami Widayanti", jk: "P" },
    //     { nama: "Asy-Syifa Nur'aini", jk: "P" },
    //     { nama: "Carysa Syarla Musabih", jk: "P" },
    //     { nama: "Daffaa Wahyu Antakesuma", jk: "L" },
    //     { nama: "Febrian Ilham Abdullah", jk: "L" },
    //     { nama: "Ghatan Adya Pratama", jk: "L" },
    //     { nama: "Hadi Nenchi Verlina", jk: "P" },
    //     { nama: "Humairah Hud Alham", jk: "P" },
    //     { nama: "Julio Raffael Rahma Yudin", jk: "L" },
    //     { nama: "Kezia Putri Wijaya", jk: "P" },
    //     { nama: "Maulana Mufti Yahya", jk: "L" },
    //     { nama: "Miralti", jk: "P" },
    //     { nama: "Mona Verlitta Putri", jk: "P" },
    //     { nama: "Muhammad Alif Ambia", jk: "L" },
    //     { nama: "Muhammad Fahri Muhammad", jk: "L" },
    //     { nama: "Muhammad Faqih Hibatullah", jk: "L" },
    //     { nama: "Muhammad Ramadian Ramadhan", jk: "L" }, // #22 (Will be skipped)
    //     { nama: "Muhammad Rizky Fahreza", jk: "L" },
    //     { nama: "Naufal Murtadho", jk: "L" },
    //     { nama: "Naura Aeprillya Effendi", jk: "P" },
    //     { nama: "Nayla Zara", jk: "P" },
    //     { nama: "Octavian Bangkit Sanjaya", jk: "L" },
    //     { nama: "Rafidan Athari", jk: "L" },
    //     { nama: "Raditya Zahran Aulia Nugroho", jk: "L" },
    //     { nama: "Rafka Duan Keano", jk: "L" },
    //     { nama: "Rafka Raditya Putra Maulana", jk: "L" },
    //     { nama: "Rakha Fawwaz Janitra", jk: "L" },
    //     { nama: "Silfina Fithriya Rayya Affandi", jk: "P" },
    //     { nama: "Yoga Gautama", jk: "L" },
    //     { nama: "Yuke Fara Nurul Aini", jk: "P" },
    //     { nama: "Zaina Zahrotushofa", jk: "P" }
    // ];

    // // Remove #22 (Index 21) or filter by name "Muhammad Ramadian Ramadhan"
    // // User said "nomor 22 gausah". 1-based index 22 is "Muhammad Ramadian Ramadhan".
    // const siswaData = siswaDataRaw.filter(s => s.nama !== "Muhammad Ramadian Ramadhan");

    // for (const siswaInfo of siswaData) {
    //     // Check if exists
    //     const existingSiswa = await db.query.siswa.findFirst({
    //         where: (t, { eq, and }) => and(
    //             eq(t.nama, siswaInfo.nama),
    //             eq(t.kelasId, kelasRPL1.id)
    //         )
    //     });

    //     if (existingSiswa) {
    //         console.log(`⏭️ Siswa ${siswaInfo.nama} sudah ada. Skip.`);
    //         continue;
    //     }

    //     // Generate dummy NIS (e.g. 2324 + random 4 digit) - or unique sequencing
    //     const nisDummy = Math.floor(10000000 + Math.random() * 90000000).toString();

    //     await db.insert(siswa).values({
    //         nama: siswaInfo.nama,
    //         nis: nisDummy,
    //         jenisKelamin: siswaInfo.jk as any,
    //         kelasId: kelasRPL1.id
    //     });
    // }
    // console.log("✅ Data Siswa XI RPL 1 berhasil disimpan!");


    // --- 8. SEEDING QR KELAS ---
    console.log("Menyimpan QR Kelas XI RPL 1...");
    const existingQr = await db.query.qrKelas.findFirst({ where: (t, { eq }) => eq(t.kelasId, kelasRPL1.id) });

    if (!existingQr) {
        await db.insert(qrKelas).values({
            kelasId: kelasRPL1.id,
            tokenQr: `QR_TOKEN_${kelasRPL1.id}_${Date.now()}`,
            isActive: true
        });
        console.log("✅ QR Kelas berhasil dibuat!");
    } else {
        console.log("⏭️ QR Kelas sudah ada. Skip.");
    }

    console.log("🎉 Seeding Selesai!");
    process.exit(0);

}

main();