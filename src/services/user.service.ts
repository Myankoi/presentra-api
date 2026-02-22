import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq, like } from "drizzle-orm";
import { auth } from "../config/firebase.js";
import { AppError } from "../types/index.js";
import ExcelJS from "exceljs";

// ============ TYPES ============

type UserRole = "admin" | "guru" | "sekretaris" | "bk";

interface CreateUserPayload {
    nama: string;
    email: string;
    role: UserRole;
    linkedSiswaId?: number;
}

interface BulkRowResult {
    row: number;
    nama: string;
    email: string;
    status: "created" | "updated";
}

interface BulkRowError {
    row: number;
    nama: string;
    email: string;
    reason: string;
}

interface BulkImportSummary {
    totalProcessed: number;
    successCount: number;
    failedCount: number;
    results: BulkRowResult[];
    errors: BulkRowError[];
}

// ============ CONSTANTS ============

const DEFAULT_PASSWORD = "Presentra2026!";
const DUMMY_UID_PREFIX = "FIREBASE_UID_";

// ============ ENDPOINT 1: SINGLE USER CREATION ============

export const createSingleUser = async (payload: CreateUserPayload) => {
    const { nama, email, role, linkedSiswaId } = payload;

    // 1. Validate required fields
    if (!nama || !email || !role) {
        throw new AppError("Field nama, email, dan role wajib diisi.", 400);
    }

    const validRoles: UserRole[] = ["admin", "guru", "sekretaris", "bk"];
    if (!validRoles.includes(role)) {
        throw new AppError(
            `Role tidak valid. Pilihan: ${validRoles.join(", ")}`,
            400
        );
    }

    // 2. Create Firebase Auth account
    const firebaseUser = await auth.createUser({
        email,
        password: DEFAULT_PASSWORD,
        displayName: nama,
    });

    // 3. Insert into DB — with rollback on failure
    try {
        await db.insert(users).values({
            nama,
            email,
            firebaseUid: firebaseUser.uid,
            role,
            linkedSiswaId: linkedSiswaId ?? null,
        });
    } catch (dbError) {
        // ROLLBACK: delete the orphan Firebase account
        try {
            await auth.deleteUser(firebaseUser.uid);
        } catch (rollbackError) {
            console.error(
                `⚠️ CRITICAL: Failed to rollback Firebase user ${firebaseUser.uid} after DB insert failure.`,
                rollbackError
            );
        }

        throw new AppError(
            `Gagal menyimpan user ke database. Firebase account telah di-rollback. Detail: ${dbError instanceof Error ? dbError.message : String(dbError)
            }`,
            500
        );
    }

    return {
        id: firebaseUser.uid,
        nama,
        email,
        role,
    };
};

// ============ ENDPOINT 2: BULK IMPORT & SYNC VIA EXCEL ============

export const bulkImportUsers = async (
    fileBuffer: Buffer
): Promise<BulkImportSummary> => {
    // 1. Parse Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer as unknown as ExcelJS.Buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
        throw new AppError("File Excel tidak memiliki worksheet.", 400);
    }

    // 2. Map header columns (case-insensitive)
    const headerRow = worksheet.getRow(1);
    const headerMap: Record<string, number> = {};
    headerRow.eachCell((cell, colNumber) => {
        const value = String(cell.value ?? "").trim().toUpperCase();
        headerMap[value] = colNumber;
    });

    const requiredHeaders = ["NAMA", "EMAIL", "ROLE"];
    const missingHeaders = requiredHeaders.filter((h) => !(h in headerMap));
    if (missingHeaders.length > 0) {
        throw new AppError(
            `Kolom wajib tidak ditemukan di Excel: ${missingHeaders.join(", ")}. Kolom yang terdeteksi: ${Object.keys(headerMap).join(", ")}`,
            400
        );
    }

    // 3. Parse rows (skip header)
    interface ParsedRow {
        rowNumber: number;
        kodeGuru: string;
        nama: string;
        email: string;
        role: string;
    }

    const rows: ParsedRow[] = [];
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header

        const getCellValue = (colName: string): string => {
            const colIdx = headerMap[colName];
            if (!colIdx) return "";
            return String(row.getCell(colIdx).value ?? "").trim();
        };

        rows.push({
            rowNumber,
            kodeGuru: getCellValue("KODE_GURU"),
            nama: getCellValue("NAMA"),
            email: getCellValue("EMAIL"),
            role: getCellValue("ROLE").toLowerCase(),
        });
    });

    if (rows.length === 0) {
        throw new AppError("File Excel tidak memiliki data (hanya header).", 400);
    }

    // 4. Process each row with isolated failure handling
    const results: BulkRowResult[] = [];
    const errors: BulkRowError[] = [];
    const validRoles: string[] = ["admin", "guru", "sekretaris", "bk"];

    for (const row of rows) {
        try {
            // Basic validation
            if (!row.nama) {
                throw new Error("Kolom NAMA kosong.");
            }
            if (!row.email) {
                throw new Error("Kolom EMAIL kosong.");
            }
            if (!validRoles.includes(row.role)) {
                throw new Error(
                    `Role "${row.role}" tidak valid. Pilihan: ${validRoles.join(", ")}`
                );
            }

            // Check if user already exists by nama (LIKE match)
            const [existingUser] = await db
                .select({
                    id: users.id,
                    nama: users.nama,
                    email: users.email,
                    firebaseUid: users.firebaseUid,
                })
                .from(users)
                .where(like(users.nama, row.nama))
                .limit(1);

            if (existingUser && existingUser.firebaseUid.startsWith(DUMMY_UID_PREFIX)) {
                // --- EXISTING USER WITH DUMMY UID: UPDATE ---
                const firebaseUser = await auth.createUser({
                    email: row.email,
                    password: DEFAULT_PASSWORD,
                    displayName: row.nama,
                });

                try {
                    await db
                        .update(users)
                        .set({
                            email: row.email,
                            firebaseUid: firebaseUser.uid,
                        })
                        .where(eq(users.id, existingUser.id));
                } catch (dbError) {
                    // Rollback Firebase account on DB failure
                    try {
                        await auth.deleteUser(firebaseUser.uid);
                    } catch (rollbackErr) {
                        console.error(
                            `⚠️ CRITICAL: Rollback gagal untuk Firebase user ${firebaseUser.uid}`,
                            rollbackErr
                        );
                    }
                    throw dbError;
                }

                results.push({
                    row: row.rowNumber,
                    nama: row.nama,
                    email: row.email,
                    status: "updated",
                });
            } else if (existingUser) {
                // User exists but already has a real Firebase UID — skip
                throw new Error(
                    `User "${row.nama}" sudah terdaftar dengan akun Firebase yang valid. Lewati.`
                );
            } else {
                // --- NEW USER: CREATE ---
                const firebaseUser = await auth.createUser({
                    email: row.email,
                    password: DEFAULT_PASSWORD,
                    displayName: row.nama,
                });

                try {
                    await db.insert(users).values({
                        nama: row.nama,
                        email: row.email,
                        firebaseUid: firebaseUser.uid,
                        role: row.role as UserRole,
                    });
                } catch (dbError) {
                    // Rollback Firebase account on DB failure
                    try {
                        await auth.deleteUser(firebaseUser.uid);
                    } catch (rollbackErr) {
                        console.error(
                            `⚠️ CRITICAL: Rollback gagal untuk Firebase user ${firebaseUser.uid}`,
                            rollbackErr
                        );
                    }
                    throw dbError;
                }

                results.push({
                    row: row.rowNumber,
                    nama: row.nama,
                    email: row.email,
                    status: "created",
                });
            }
        } catch (err) {
            errors.push({
                row: row.rowNumber,
                nama: row.nama,
                email: row.email,
                reason: err instanceof Error ? err.message : String(err),
            });
        }
    }

    return {
        totalProcessed: rows.length,
        successCount: results.length,
        failedCount: errors.length,
        results,
        errors,
    };
};
