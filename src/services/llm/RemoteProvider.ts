import type { LLMService } from "./index";

/**
 * Remote LLM provider that calls the ltex-sync-server AI proxy endpoint.
 * Available on the web target and on Tauri when the user is signed in.
 * Phase 2 stub — full implementation requires auth token from AuthService.
 */
export class RemoteProvider implements LLMService {
  readonly name = "Remote AI";

  async complete(_prompt: string): Promise<string> {
    // TODO(phase-2): POST to /api/ai/complete on ltex-sync-server with
    // Authorization: Bearer <jwt> header.
    throw new Error("RemoteProvider: not yet implemented (Phase 2)");
  }
}
