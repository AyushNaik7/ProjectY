/**
 * Firebase Admin SDK — Server-side only
 *
 * This runs in Next.js API routes (server-side), NOT in the browser.
 * It bypasses Firestore security rules using Admin privileges.
 *
 * For Spark plan: API routes replace Cloud Functions.
 * For Blaze plan: Cloud Functions are preferred (functions/src/index.ts).
 */

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let adminApp: App;

if (!getApps().length) {
    // Option 1: Service account key file (recommended for production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        adminApp = initializeApp({
            credential: cert(serviceAccount),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    } else {
        // Option 2: Default credentials (works in Firebase/GCP environments)
        // For local dev, uses project ID from env
        adminApp = initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    }
} else {
    adminApp = getApps()[0];
}

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export default adminApp;
