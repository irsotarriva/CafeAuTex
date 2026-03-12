import { db, type StoredDocument } from "./db";
import { serialize, deserialize } from "@/model/serialization";
import type { DocumentTree } from "@/model/nodes";

export async function saveDocument(tree: DocumentTree): Promise<void> {
  const root = tree.nodes[tree.rootId];
  const title =
    root?.type === "document"
      ? (root.metadata as { title: string }).title
      : "Untitled";

  const stored: StoredDocument = {
    id: tree.rootId,
    title,
    updatedAt: Date.now(),
    data: serialize(tree),
  };

  await db.documents.put(stored);
}

export async function loadDocument(id: string): Promise<DocumentTree | null> {
  const stored = await db.documents.get(id);
  if (!stored) return null;
  return deserialize(stored.data);
}

export async function listDocuments(): Promise<Omit<StoredDocument, "data">[]> {
  const all = await db.documents.orderBy("updatedAt").reverse().toArray();
  return all.map(({ id, title, updatedAt }) => ({ id, title, updatedAt }));
}

export async function deleteDocument(id: string): Promise<void> {
  await db.documents.delete(id);
}
