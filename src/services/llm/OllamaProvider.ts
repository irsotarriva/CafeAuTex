import type { LLMService } from "./index";

/**
 * Tauri-only LLM provider that talks to a locally running Ollama instance.
 * Phase 1 stub — full implementation will use the Tauri shell plugin to query
 * the Ollama HTTP API (http://localhost:11434) and stream completions.
 */
export class OllamaProvider implements LLMService {
  readonly name = "Ollama (local)";

  async complete(_prompt: string): Promise<string> {
    // TODO(phase-1): Invoke Ollama via fetch to http://localhost:11434/api/generate
    // The shell plugin is available here because this file is only imported in
    // the Tauri build target.
    throw new Error("OllamaProvider: not yet implemented (Phase 1)");
  }
}
