import type { FileService, FileHandle } from "./index";

/**
 * Browser file system provider using the File System Access API
 * (showOpenFilePicker / showSaveFilePicker).
 * Falls back to <input type="file"> for browsers that don't support the API.
 * Phase 1 stub.
 */
export class BrowserProvider implements FileService {
  async open(_options?: { filters?: { name: string; extensions: string[] }[] }): Promise<FileHandle | null> {
    // TODO(phase-1): Call window.showOpenFilePicker() (with accept types derived
    // from filters) and wrap the returned FileSystemFileHandle.
    throw new Error("BrowserProvider.open: not yet implemented (Phase 1)");
  }

  async save(_options?: { defaultPath?: string }): Promise<FileHandle | null> {
    // TODO(phase-1): Call window.showSaveFilePicker() and wrap the returned handle.
    throw new Error("BrowserProvider.save: not yet implemented (Phase 1)");
  }
}
