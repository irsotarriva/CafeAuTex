# Architecture

The full implementation plan — including phase-by-phase task breakdown, dependency
mapping, component design decisions, and ticket templates — lives in Notion:

**[Café AuTex — Implementation Plan](https://www.notion.so/321f25b851a181f4ba16f61f8ff646a2)**

---

## Delivery Targets

The frontend codebase builds to two distinct targets from the same source. The target is
selected at build time via the `VITE_APP_TARGET` environment variable (set in `.env.tauri` and
`.env.web`).

### Tauri desktop app

Built with `pnpm build` (or `pnpm vite:build` for the frontend alone).

- Local LLM (Ollama) available without signing in
- Full native file system access via the Tauri fs plugin
- Sign-in is **optional** — the app opens immediately in guest mode; auth is prompted only when
  the user accesses a gated feature (remote LLM, team collaboration)
- Works entirely offline

### Web browser app

Built with `pnpm web:build` and deployed as a static site.

- Remote LLM only — no access to the local Ollama process
- Sign-in is **required** — `AuthGuard` blocks the app until authenticated
- File access via the browser File System Access API

### Capability matrix

| Capability            | Desktop (guest) | Desktop (signed in) | Web (signed in) |
|-----------------------|-----------------|---------------------|-----------------|
| Local LLM (Ollama)    | ✅              | ✅                  | ❌              |
| Remote LLM            | ❌              | ✅                  | ✅              |
| Native file system    | ✅              | ✅                  | ❌              |
| Browser file access   | ❌              | ❌                  | ✅              |
| Team collaboration    | ❌              | ✅                  | ✅              |
| Works offline         | ✅              | ✅                  | ❌              |
| Auth required         | No              | Completed           | Yes (gate)      |

### Platform abstraction layer

Shared feature code never imports platform-specific APIs directly. It uses:

- **`src/platform/index.ts`** — build-time boolean flags (`IS_TAURI`, `IS_WEB`,
  `AUTH_REQUIRED`, `LOCAL_LLM_AVAILABLE`). Vite replaces these statically, enabling dead-code
  elimination of the other target's branches.
- **`src/services/`** — `LLMService`, `FileService`, `AuthService` interfaces with
  platform-specific implementations selected via dynamic `import()` factories. Each provider
  file is only included in the bundle where it is needed.
- **`src/guards/AuthGuard.tsx`** — passthrough on Tauri; hard login gate on web.
- **`src/contexts/AuthContext.tsx`** — React context backed by the target's `AuthService`.

### Build commands

| Command | Output | Purpose |
|---------|--------|---------|
| `pnpm build` | Tauri binary | Full desktop release |
| `pnpm dev` | Tauri + hot reload | Desktop development |
| `pnpm web:build` | `dist/` (static) | Web deployment |
| `pnpm web:dev` | Vite dev server | Web development |

---

## Two-Repository Split

The project is intentionally split into two repositories to keep the offline-first desktop app
decoupled from the optional sync infrastructure.

### `cafe-autex` (this repository)

The Tauri desktop app and web browser app. Everything that runs on the user's machine or in
their browser:

- **React 18 + TypeScript frontend** — UI shell, editor canvas, all panels
- **ProseMirror editor engine** — schema, node views, plugins, keymaps
- **Zustand state layer** — document state, UI state, settings, collaboration presence
- **Dexie.js local storage** — IndexedDB persistence for the document tree, bibliography, and asset metadata
- **LaTeX export engine** — tree-walker that emits valid compilable LaTeX; Tectonic sidecar for PDF compilation
- **Yjs CRDT layer** — collaborative editing state; encryption applied before any network call
- **MCP server** (`mcp-server/`) — Python FastMCP process exposing document tree tools to local AI and external tooling
- **Plugin system** — EditorPlugin interface, core bundled plugins, community plugin loader
- **Template system** — versioned frozen project snapshots; official journal and thesis templates

The app is fully functional in offline mode. No account, no network connection, and no sync
server are required.

### `ltex-sync-server` (separate repository, TBD)

The optional collaboration backend. Handles only what the client cannot do locally:

- **y-websocket relay** — broadcasts encrypted Yjs update payloads between connected clients
- **Encrypted blob storage** — stores encrypted document snapshots and asset binaries (S3-compatible)
- **User auth and key exchange** — JWT-based auth; brokers X25519 public key exchange for document encryption key sharing
- **Permissions API** — document ownership, collaborator access, invite flow

The server never sees plaintext document content. All document data is encrypted client-side
before transmission. The server is fully open source and self-hostable.

---

## Key Design Principles

**Offline mode is complete, not degraded.** Every feature except real-time collaboration
works without a network connection. Online mode adds collaboration — it does not unlock
core functionality.

**The document tree is the source of truth.** The LaTeX source and the PDF are both outputs
of the tree. The tree is stored in IndexedDB via Dexie.js. The CRDT layer (Yjs) manages
concurrent edits to this tree in online mode.

**The server is dumb.** The sync server routes encrypted bytes. It has no document parsing
logic, no merge logic, and no access to plaintext content. This is a deliberate architectural
constraint, not a limitation to work around.

**Privacy is structural, not policy.** Encryption is applied in the client before any data
leaves the device. The server cannot access document content even if compelled to.
