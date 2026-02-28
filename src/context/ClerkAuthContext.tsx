"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

interface AuthContextType {
  user: any | null;
  role: "creator" | "brand" | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setRole: (role: "creator" | "brand") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function ClerkAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [role, setRoleState] = useState<"creator" | "brand" | null>(null);

  useEffect(() => {
    if (isLoaded && clerkUser) {
      // Get role from Clerk user metadata
      const userRole = clerkUser.publicMetadata?.role as "creator" | "brand" | undefined;
      setRoleState(userRole || null);
    } else if (isLoaded && !clerkUser) {
      setRoleState(null);
    }
  }, [clerkUser, isLoaded]);

  const signOut = async () => {
    await clerkSignOut();
    setRoleState(null);
  };

  const setRole = async (newRole: "creator" | "brand") => {
    if (!clerkUser) return;
    
    // Update Clerk user metadata via API route
    try {
      const response = await fetch('/api/user/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('API error:', data);
        throw new Error(data.error || 'Failed to update role');
      }
      
      // Update local state
      setRoleState(newRole);
      
      // Reload user to get updated metadata
      await clerkUser.reload();
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: clerkUser,
        role,
        loading: !isLoaded,
        signOut,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within ClerkAuthProvider");
  }
  return context;
}
