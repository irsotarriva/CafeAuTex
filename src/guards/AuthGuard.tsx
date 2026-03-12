import React from "react";
import { AUTH_REQUIRED } from "@/platform";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Route guard that enforces authentication based on the build target.
 *
 * - Web target (AUTH_REQUIRED = true): renders a login screen until the user
 *   is authenticated. The app content is never mounted unauthenticated.
 * - Tauri target (AUTH_REQUIRED = false): renders children immediately. The
 *   user is always in guest mode unless they explicitly sign in to unlock
 *   team/remote features (handled inside those features, not here).
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, signIn } = useAuth();

  if (AUTH_REQUIRED && !isAuthenticated) {
    return <LoginScreen onSignIn={signIn} />;
  }

  return <>{children}</>;
}

interface LoginScreenProps {
  onSignIn: () => Promise<void>;
}

function LoginScreen({ onSignIn }: LoginScreenProps) {
  const [loading, setLoading] = React.useState(false);

  async function handleSignIn() {
    setLoading(true);
    try {
      await onSignIn();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        fontFamily: "Lato, -apple-system, sans-serif",
        background: "#faf8f5",
        color: "#2c2520",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <h1 style={{ fontSize: "28px", fontWeight: 600, margin: 0 }}>Café AuTex</h1>
      <p style={{ color: "#8c8078", margin: 0, fontSize: "14px" }}>
        Sign in to continue
      </p>
      <button
        onClick={() => void handleSignIn()}
        disabled={loading}
        style={{
          background: "#6b4f3a",
          color: "#faf8f5",
          border: "none",
          borderRadius: "6px",
          padding: "10px 24px",
          fontSize: "14px",
          fontFamily: "Lato, -apple-system, sans-serif",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </div>
  );
}
