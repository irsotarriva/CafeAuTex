import { IS_TAURI } from "@/platform";

export interface User {
  id: string;
  email: string;
  displayName: string;
}

/** Minimal contract every auth provider must satisfy. */
export interface AuthService {
  /** Currently signed-in user, or null if anonymous. */
  readonly currentUser: User | null;
  /** True when a valid session is active. */
  readonly isAuthenticated: boolean;
  /** Initiate the sign-in flow (redirect or modal). */
  signIn(): Promise<void>;
  /** End the current session. */
  signOut(): Promise<void>;
}

/**
 * Returns the appropriate auth provider for the current build target.
 *
 * - Tauri: NoopProvider — always returns null user (guest mode). The user can
 *   explicitly trigger sign-in to unlock team/remote features.
 * - Web: JwtProvider — manages JWT sessions against ltex-sync-server.
 */
export async function createAuthService(): Promise<AuthService> {
  if (IS_TAURI) {
    const { NoopProvider } = await import("./NoopProvider");
    return new NoopProvider();
  }
  const { JwtProvider } = await import("./JwtProvider");
  return new JwtProvider();
}
