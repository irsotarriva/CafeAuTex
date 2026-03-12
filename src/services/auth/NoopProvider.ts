import type { AuthService, User } from "./index";

/**
 * Tauri guest-mode auth provider.
 * The user is always anonymous. Calling signIn() will eventually open the
 * ltex-sync-server login flow (Phase 2) so the user can unlock team features
 * on their local copy without switching to the web app.
 */
export class NoopProvider implements AuthService {
  readonly currentUser: User | null = null;
  readonly isAuthenticated = false;

  async signIn(): Promise<void> {
    // TODO(phase-2): Open ltex-sync-server OAuth / magic-link flow in a Tauri
    // window and exchange the resulting token for a JWT.
    throw new Error("NoopProvider.signIn: not yet implemented (Phase 2)");
  }

  async signOut(): Promise<void> {
    // No-op — there is no session to clear.
  }
}
