import type { FileService, FileHandle } from "./index";

/**
 * Tauri-only file system provider.
 * Uses @tauri-apps/plugin-fs and the read_file / write_file Tauri commands.
 * Phase 1 stub — full implementation wires up the OS dialog APIs.
 */
export class TauriProvider implements FileService {
  async open(_options?: { filters?: { name: string; extensions: string[] }[] }): Promise<FileHandle | null> {
    // TODO(phase-1): Use open() from @tauri-apps/plugin-dialog and
    // read_file Tauri command for the chosen path.
    throw new Error("TauriProvider.open: not yet implemented (Phase 1)");
  }

  async save(_options?: { defaultPath?: string }): Promise<FileHandle | null> {
    // TODO(phase-1): Use save() from @tauri-apps/plugin-dialog and
    // write_file Tauri command for the chosen path.
    throw new Error("TauriProvider.save: not yet implemented (Phase 1)");
  }
}
