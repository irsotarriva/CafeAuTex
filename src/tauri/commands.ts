/**
 * Typed wrappers around Tauri IPC commands.
 * All file I/O in the app must go through these functions.
 */

import { invoke } from "@tauri-apps/api/core";

export interface CompileResult {
  success: boolean;
  pdf_path: string | null;
  log: string;
}

// ─── File commands ────────────────────────────────────────────────────────────

export async function readFile(path: string): Promise<string> {
  return invoke<string>("read_file", { path });
}

export async function writeFile(path: string, content: string): Promise<void> {
  return invoke<void>("write_file", { path, content });
}

export async function showInFolder(path: string): Promise<void> {
  return invoke<void>("show_in_folder", { path });
}

// ─── Compile command ──────────────────────────────────────────────────────────

export async function compileLaTeX(
  texPath: string,
  outputDir: string,
): Promise<CompileResult> {
  return invoke<CompileResult>("compile_latex", {
    texPath,
    outputDir,
  });
}

// ─── Dialog commands (delegated to Rust) ─────────────────────────────────────

export interface DialogFilter {
  name: string;
  extensions: string[];
}

export async function openFileDialog(filters: DialogFilter[] = []): Promise<string | null> {
  return invoke<string | null>("open_file_dialog", { filters });
}

export async function saveFileDialog(filters: DialogFilter[] = []): Promise<string | null> {
  return invoke<string | null>("save_file_dialog", { filters });
}
