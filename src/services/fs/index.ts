import { IS_TAURI } from "@/platform";

/** A file handle returned by open/save dialogs. */
export interface FileHandle {
  /** Absolute path (Tauri) or file name (browser — full path not available). */
  readonly path: string;
  read(): Promise<string>;
  write(content: string): Promise<void>;
}

/** Minimal contract every file system provider must satisfy. */
export interface FileService {
  /** Show an open dialog and return a handle to the chosen file. */
  open(options?: { filters?: { name: string; extensions: string[] }[] }): Promise<FileHandle | null>;
  /** Show a save dialog and return a handle to the destination. */
  save(options?: { defaultPath?: string }): Promise<FileHandle | null>;
}

/**
 * Returns the appropriate file system provider for the current build target.
 *
 * - Tauri: TauriProvider — native OS dialogs via @tauri-apps/plugin-fs
 * - Web: BrowserProvider — File System Access API (showOpenFilePicker)
 */
export async function createFileService(): Promise<FileService> {
  if (IS_TAURI) {
    const { TauriProvider } = await import("./TauriProvider");
    return new TauriProvider();
  }
  const { BrowserProvider } = await import("./BrowserProvider");
  return new BrowserProvider();
}
