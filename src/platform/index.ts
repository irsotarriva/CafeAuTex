/**
 * Build-time platform capability flags.
 *
 * VITE_APP_TARGET is set at build time via --mode tauri (uses .env.tauri) or
 * --mode web (uses .env.web). Vite replaces import.meta.env.* statically, so
 * dead branches in platform-specific code are tree-shaken from the output bundle.
 *
 * Do not import platform-specific APIs (e.g. @tauri-apps/*) directly in shared
 * code. Use the service factories in src/services/ instead — they select the
 * correct provider via dynamic import() so the other target's code is excluded
 * from the bundle.
 */

/** True when built for the Tauri desktop target. */
export const IS_TAURI = import.meta.env.VITE_APP_TARGET === "tauri";

/** True when built for the web browser target. */
export const IS_WEB = import.meta.env.VITE_APP_TARGET === "web";

/**
 * Whether authentication is required before the app can be used.
 * - Web: true — login gate is enforced on the root route.
 * - Tauri: false — the app opens immediately; auth is prompted only when the
 *   user accesses a gated feature (remote LLM, team collaboration).
 */
export const AUTH_REQUIRED = IS_WEB;

/**
 * Whether the local Ollama LLM provider is available.
 * Only true on the Tauri target, where the shell plugin can spawn Ollama.
 */
export const LOCAL_LLM_AVAILABLE = IS_TAURI;

/**
 * Whether remote (server-hosted) LLM is available.
 * Available on the web target and on Tauri when the user is signed in.
 * At build time this reflects the capability, not the current auth state.
 */
export const REMOTE_LLM_AVAILABLE = IS_WEB;
