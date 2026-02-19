import admin from "firebase-admin";
import { Auth } from "firebase-admin/auth";
import { Messaging } from "firebase-admin/messaging";
import { readFileSync } from "fs";
import { join } from "path";
import "dotenv/config";

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json";
const serviceAccount = JSON.parse(
    readFileSync(join(process.cwd(), serviceAccountPath), "utf8")
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export const auth: Auth = admin.auth();
export const messaging: Messaging = admin.messaging();

console.log("🔥 Firebase Admin initialized with explicit types!");