import { create } from "zustand";
import { db } from "@/storage/db";
import type { Asset } from "@/model/nodes";

interface AssetState {
  assets: Map<string, Asset>;
  addAsset: (asset: Asset) => Promise<void>;
  getAsset: (hash: string) => Asset | undefined;
  loadAssets: () => Promise<void>;
}

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: new Map(),

  async addAsset(asset: Asset) {
    // Deduplicate: if hash already stored, skip
    if (!get().assets.has(asset.hash)) {
      await db.assets.put(asset);
      set((state) => {
        const next = new Map(state.assets);
        next.set(asset.hash, asset);
        return { assets: next };
      });
    }
  },

  getAsset(hash: string) {
    return get().assets.get(hash);
  },

  async loadAssets() {
    const all = await db.assets.toArray();
    const map = new Map<string, Asset>();
    for (const a of all) map.set(a.hash, a);
    set({ assets: map });
  },
}));

/**
 * Compute a SHA-256 hash for an ArrayBuffer and return a hex string.
 */
export async function computeHash(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Read a File object into an Asset, computing its content hash.
 */
export async function fileToAsset(file: File): Promise<Asset> {
  const buffer = await file.arrayBuffer();
  const hash = await computeHash(buffer);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        hash,
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        dataUrl: reader.result as string,
        sizeBytes: file.size,
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
