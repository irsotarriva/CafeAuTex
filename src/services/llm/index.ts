import { IS_TAURI } from "@/platform";

/** Minimal contract every LLM provider must satisfy. */
export interface LLMService {
  /** Send a prompt and receive the completed text. */
  complete(prompt: string): Promise<string>;
  /** Human-readable name shown in the UI (e.g. "Ollama / qwen2.5-coder"). */
  readonly name: string;
}

/**
 * Returns the appropriate LLM provider for the current build target.
 *
 * - Tauri (anonymous): OllamaProvider (local Ollama)
 * - Tauri (signed in): OllamaProvider + optionally RemoteProvider (added in Phase 2)
 * - Web: RemoteProvider
 *
 * Dynamic import() ensures each provider file is only included in the bundle
 * where it is actually needed.
 */
export async function createLLMService(): Promise<LLMService> {
  if (IS_TAURI) {
    const { OllamaProvider } = await import("./OllamaProvider");
    return new OllamaProvider();
  }
  const { RemoteProvider } = await import("./RemoteProvider");
  return new RemoteProvider();
}
