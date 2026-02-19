"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  role: "creator" | "brand" | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ) => Promise<void>;
  signOut: () => Promise<void>;
  setRole: (role: "creator" | "brand") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<"creator" | "brand" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setUser(data.session.user);
          // Prefer role from user metadata, fallback to localStorage
          const metaRole = (data.session.user.user_metadata as any)?.role as
            | "creator"
            | "brand"
            | undefined;
          const savedRole =
            (metaRole as "creator" | "brand") ||
            (localStorage.getItem("userRole") as "creator" | "brand" | null);
          setRoleState(savedRole);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        const metaRole = (session.user.user_metadata as any)?.role as
          | "creator"
          | "brand"
          | undefined;
        const savedRole =
          (metaRole as "creator" | "brand") ||
          (localStorage.getItem("userRole") as "creator" | "brand" | null);
        setRoleState(savedRole);
      } else {
        setUser(null);
        setRoleState(null);
        localStorage.removeItem("userRole");
      }
      setLoading(false);
    });

    return () => {
      data.subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // If the user selected a role during signup (stored as pending), persist it to user metadata
    try {
      const pending = localStorage.getItem("userRolePending") as
        | "creator"
        | "brand"
        | null;
      if (pending && data.user) {
        const { error: updErr } = await supabase.auth.updateUser({
          data: { role: pending },
        });
        if (updErr) throw updErr;
        localStorage.removeItem("userRolePending");
        localStorage.setItem("userRole", pending);
        setRoleState(pending);
      } else {
        // If there's role metadata already on the user, set it
        const metaRole = (data.user?.user_metadata as any)?.role as
          | "creator"
          | "brand"
          | undefined;
        if (metaRole) {
          setRoleState(metaRole);
          localStorage.setItem("userRole", metaRole);
        }
      }
    } catch (err) {
      console.error("Error persisting pending role:", err);
    }

    return data;
  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: metadata ? { data: metadata } : undefined,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem("userRole");
  };

  const setRole = async (newRole: "creator" | "brand") => {
    // Persist role to Supabase user metadata and locally
    try {
      const { error } = await supabase.auth.updateUser({
        data: { role: newRole },
      });
      if (error) throw error;
      localStorage.setItem("userRole", newRole);
      setRoleState(newRole);
    } catch (err) {
      // Fallback to localStorage if update fails
      console.error("Failed to update user metadata, saving locally:", err);
      localStorage.setItem("userRole", newRole);
      setRoleState(newRole);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loading, signIn, signUp, signOut, setRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within SupabaseAuthProvider");
  }
  return context;
}
