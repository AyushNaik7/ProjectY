/**
 * Auth Library — handles Firebase Authentication ONLY.
 *
 * IMPORTANT: This file does NOT write to Firestore.
 * All Firestore writes (user doc creation, role setting, profiles)
 * go through Cloud Functions via src/lib/functions.ts.
 *
 * Architecture:
 *   signUp → createUserWithEmailAndPassword (Auth only)
 *   → frontend calls callInitializeUser(role) (Cloud Function)
 *   → CF creates users/{uid} doc via Admin SDK
 */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export type UserRole = "creator" | "brand";

export interface UserProfile {
    uid: string;
    email: string;
    role?: UserRole;
    onboardingComplete: boolean;
    createdAt: Date;
}

/**
 * Create a Firebase Auth account. Does NOT write to Firestore.
 * After calling this, immediately call callInitializeUser(role) from functions.ts.
 */
export async function signUp(email: string, password: string): Promise<User> {
    if (!auth) throw new Error("Firebase not configured");
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return credential.user;
}

export async function signIn(email: string, password: string): Promise<User> {
    if (!auth) throw new Error("Firebase not configured");
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
}

export async function signOut(): Promise<void> {
    if (!auth) return;
    await firebaseSignOut(auth);
}

/**
 * Read user profile from Firestore (read-only).
 * This is allowed by security rules for the document owner.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!db) return null;
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    }
    return null;
}

export function onAuthChange(callback: (user: User | null) => void) {
    if (!auth) {
        callback(null);
        return () => { };
    }
    return onAuthStateChanged(auth, callback);
}
