import Dexie, { type Table } from "dexie";
import type { Asset } from "@/model/nodes";

export interface StoredDocument {
  id: string;
  title: string;
  updatedAt: number; // Unix timestamp ms
  data: string; // serialized DocumentTree JSON
}

class CafeAuTexDb extends Dexie {
  documents!: Table<StoredDocument, string>;
  assets!: Table<Asset, string>;

  constructor() {
    super("cafe-autex");

    this.version(1).stores({
      // Primary key first, then indexed fields
      documents: "id, title, updatedAt",
      // Assets keyed by content hash for deduplication
      assets: "hash, filename",
    });
  }
}

// Singleton
export const db = new CafeAuTexDb();
