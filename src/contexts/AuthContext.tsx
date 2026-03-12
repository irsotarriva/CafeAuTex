import React, { createContext, useContext, useEffect, useState } from "react";
import { createAuthService, type AuthService, type User } from "@/services/auth";

interface AuthContextValue {
  isAuthenticated: boolean;
  currentUser: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [service, setService] = useState<AuthService | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    createAuthService().then((svc) => {
      setService(svc);
      setCurrentUser(svc.currentUser);
    });
  }, []);

  async function signIn() {
    if (!service) return;
    await service.signIn();
    setCurrentUser(service.currentUser);
  }

  async function signOut() {
    if (!service) return;
    await service.signOut();
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: currentUser !== null,
        currentUser,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
