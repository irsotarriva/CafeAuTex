import type { AuthService, User } from "./index";

/**
 * JWT-based auth provider for the web target (and authenticated Tauri sessions).
 * Manages token storage, refresh, and session state.
 * Phase 2 stub — full implementation requires ltex-sync-server auth endpoints.
 */
export class JwtProvider implements AuthService {
  private _user: User | null = null;

  get currentUser(): User | null {
    return this._user;
  }

  get isAuthenticated(): boolean {
    return this._user !== null;
  }

  async signIn(): Promise<void> {
    // TODO(phase-2): Redirect to ltex-sync-server /auth/login (or open an in-app
    // modal), receive JWT via callback, validate it, and populate this._user.
    throw new Error("JwtProvider.signIn: not yet implemented (Phase 2)");
  }

  async signOut(): Promise<void> {
    // TODO(phase-2): Clear the stored JWT and reset this._user to null.
    this._user = null;
  }
}
