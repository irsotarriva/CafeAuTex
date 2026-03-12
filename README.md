# Café AuTex

> Offline-first WYSIWYG LaTeX editor with real-time collaboration and AI completion

[![CI](https://github.com/irsotarriva/cafe-autex/actions/workflows/ci.yml/badge.svg)](https://github.com/irsotarriva/cafe-autex/actions/workflows/ci.yml)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](./LICENSE)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-lightgrey)](#getting-started-development)

---

## What is this?

Café AuTex is a desktop LaTeX editor that treats the document as a semantic node tree rather than a raw `.tex` file. The LaTeX source and rendered PDF are both *outputs* of this tree — neither is the source of truth. This inversion means that all the administrative overhead of large LaTeX projects (managing `\input` chains, keeping `\newcommand` namespaces consistent, resolving labels, tracking asset paths, syncing `.bib` files) is handled automatically by the editor. You write; the editor manages the plumbing.

The editing experience is block-based and fully WYSIWYG: equations render live with KaTeX as you type LaTeX math syntax, figures display inline with captions and labels, and tables are editable in a spreadsheet-style cell interface — no compile step required to see your document. When you are ready to export, Tectonic (bundled as a Tauri sidecar) compiles your document to PDF without requiring a local LaTeX installation.

Collaboration is built on Yjs CRDT with end-to-end encryption: document content is encrypted client-side before any byte leaves the device, and the sync server never sees plaintext. AI writing assistance — fill-in-the-middle completion driven by a locally-run Qwen2.5-Coder model — is strictly opt-in and runs entirely on your machine in offline mode. No document content is ever transmitted to any external service without your explicit, per-project consent.

---

## Key Features

**WYSIWYG block editing with live KaTeX rendering.** Every LaTeX element — equations, theorems, algorithms, figures, code blocks — is a typed tree node with a real-time visual representation. Editing feels like a word processor; the output compiles like LaTeX.

**LaTeX and PDF export via Tectonic.** The tree-walker export engine emits valid, compilable LaTeX with automatic preamble generation, package inference, and correct `\includegraphics` paths. PDF compilation runs via an embedded Tectonic binary — no TeX distribution required.

**First-class bibliography management.** The bibliography is a structured database integrated directly into the editor, not a sidecar file. Import references by DOI, arXiv ID, or `.bib` file. Connected databases (Semantic Scholar, arXiv, INSPIRE-HEP) are available for lookup. Cite keys are managed automatically; duplicate detection and merge are built in.

**Versioned asset management.** Figures and programmatically-generated tables maintain an append-only version stack. Upload a new version of a figure and the document updates in place; previous versions are retained and restorable with one click.

**Real-time collaboration with E2E encryption.** Built on Yjs CRDT. Multiple collaborators can edit simultaneously; changes merge without conflict. CRDT operation payloads are encrypted before transmission using a key derived client-side — the sync server handles routing, not content. Operation payloads are padded to fixed-size buckets to reduce traffic analysis exposure.

**AI fill-in-the-middle completion (local model).** Inline completion is powered by a locally-run Qwen2.5-Coder model via Ollama or llama.cpp. Context is assembled by the MCP server from the document tree — surrounding paragraphs, the command namespace, and the acronym table are included automatically. Nothing leaves the device.

**MCP server for external AI tooling.** The document tree is exposed as a Model Context Protocol server. External tools such as Continue (VS Code) can call `get_context`, `search_bib`, `resolve_ref`, and `get_timeline` to query the document as structured data rather than parsing raw `.tex` output.

**Plugin system for LaTeX package support.** Core packages (amsmath, tikz, siunitx, algorithm2e, minted, and more) ship as bundled plugins. Community plugins extend the editor with new node types, renderers, and LaTeX serialisers without modifying core.

**Academic templates.** Official templates for Physical Review Letters, IEEE, ACM, Nature, JHEP, and arXiv preprint ship out of the box. A layered versioning model separates document class and formatting from user content, so template updates never overwrite your writing.

---

## Architecture Overview

The application is split across two repositories. This repository — `cafe-autex` — contains the Tauri desktop app: the React/ProseMirror frontend, the Zustand state layer, the Dexie.js local storage, the LaTeX export engine, the MCP server, and the plugin system. The sync backend lives in a separate repository (`ltex-sync-server`, TBD) and is optional — the app is fully functional in offline mode without it.

A detailed architecture document and the implementation plan (with phase-by-phase task breakdown, dependency mapping, and ticket templates) are at [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and the [Notion implementation plan](https://www.notion.so/321f25b851a181f4ba16f61f8ff646a2).

---

## Project Status

Early development. Phase 1 (core document tree, editor scaffold, local storage, basic export) is in progress. The application is not yet usable as a daily driver. APIs and data formats may change without notice until a stable release is tagged.

Contributors are welcome at any phase. See the [Notion task tracker](https://www.notion.so/321f25b851a181f4ba16f61f8ff646a2) for available tasks and the Contributing section below.

---

## Getting Started (Development)

### Prerequisites

- **Rust** stable toolchain — install via [rustup](https://rustup.rs/)
- **Node.js** 20 or later
- **pnpm** 9 or later — `npm install -g pnpm`
- **Python** 3.11 or later (for the MCP server)
- **Tauri CLI prerequisites** — see the [Tauri v2 prerequisites guide](https://tauri.app/start/prerequisites/) for your OS (WebView2 on Windows, webkit2gtk on Linux)

### Run in development

```bash
git clone https://github.com/irsotarriva/cafe-autex.git
cd cafe-autex

# Install JS dependencies
pnpm install

# Install MCP server dependencies
cd mcp-server && pip install -r requirements.txt && cd ..

# Start the Tauri dev server (launches Vite + Rust in watch mode)
pnpm tauri dev
```

### Useful scripts

| Command | Description |
|---|---|
| `pnpm tauri dev` | Start development build with hot reload |
| `pnpm tauri build` | Production build for current platform |
| `pnpm test` | Run Vitest unit tests |
| `pnpm typecheck` | TypeScript type checking (no emit) |
| `pnpm lint` | ESLint over `src/` |
| `pnpm preview` | Preview the Vite build in browser |

---

## Repository Structure

```
cafe-autex/
├── src/                    # React/TypeScript frontend
│   ├── model/              # Document node tree types and serialization interfaces
│   ├── editor/             # ProseMirror schema, node views, plugins, keymaps
│   ├── store/              # Zustand stores (document, UI, settings, collaboration)
│   ├── storage/            # Dexie.js IndexedDB persistence layer
│   ├── export/             # LaTeX tree-walker export engine
│   ├── preview/            # PDF.js preview panel component
│   ├── bib/                # Bibliography store, DOI/arXiv/INSPIRE lookup
│   ├── assets/             # Asset manager and version history
│   ├── collaboration/      # Yjs CRDT, encryption, key exchange, presence
│   ├── annotations/        # Inline comment and annotation system
│   ├── issues/             # Issue tracker (extends annotations with PM metadata)
│   ├── timeline/           # Milestones, Gantt view, deadline tracking
│   ├── notifications/      # In-app notification system
│   ├── ai/                 # FIM completion, citation suggestions, MCP client
│   ├── plugins/            # Plugin API, plugin loader, bundled core plugins
│   ├── templates/          # Template system, setup scripts, built-in templates
│   ├── shell/              # App shell, toolbar, sidebar, status bar
│   └── utils/              # Shared utility functions
├── src-tauri/              # Tauri Rust backend
│   └── src/commands/       # Tauri commands: file I/O, Tectonic compile
├── mcp-server/             # Python FastMCP server (document tree as MCP tools)
├── docs/                   # Design system, architecture notes, node schema reference
├── .github/                # CI/CD workflows, issue templates
└── public/                 # Static assets
```

---

## Contributing

Contributions are welcome. The [Notion task tracker](https://www.notion.so/321f25b851a181f4ba16f61f8ff646a2) lists available tasks by phase — if you want to pick something up, leave a comment on the task or open a GitHub issue first so work is not duplicated.

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, etc.). All pull requests require passing CI (typecheck, lint, tests) and must include tests for any new logic. The `main` branch is protected; all changes go through PR review.

---

## License

Café AuTex is licensed under the **GNU Affero General Public License v3.0** (AGPL-3.0). See [LICENSE](./LICENSE) for the full text.

In plain terms: you are free to use, study, modify, and distribute this software for personal, academic, and open-source purposes. If you modify the software and make it available over a network (e.g., as a hosted web app), you must also make your modified source code available under the same license. This protects the project from proprietary forks while keeping it fully open for individual and academic use.
