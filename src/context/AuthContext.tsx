"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import { onAuthChange, UserRole } from "@/lib/auth";

interface AuthContextType {
    user: User | null;
    role: UserRole | null;
    onboardingComplete: boolean;
    loading: boolean;
    firebaseReady: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    onboardingComplete: false,
    loading: true,
    firebaseReady: false,
    refreshProfile: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (uid: string) => {
        if (!db) return;
        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setRole(data.role || null);
                setOnboardingComplete(data.onboardingComplete || false);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.uid);
        }
    };

    useEffect(() => {
        if (!isFirebaseConfigured) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthChange(async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                await fetchProfile(firebaseUser.uid);
            } else {
                setRole(null);
                setOnboardingComplete(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                role,
                onboardingComplete,
                loading,
                firebaseReady: isFirebaseConfigured,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
