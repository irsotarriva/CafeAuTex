import type { DocumentTree } from "./nodes";

const CURRENT_VERSION = 1;

export function serialize(tree: DocumentTree): string {
  return JSON.stringify({ ...tree, version: CURRENT_VERSION });
}

export function deserialize(json: string): DocumentTree {
  const raw: unknown = JSON.parse(json);

  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid .ltex file: not a JSON object");
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj["version"] !== "number") {
    throw new Error("Invalid .ltex file: missing version");
  }
  if (obj["version"] !== CURRENT_VERSION) {
    throw new Error(`Unsupported .ltex version: ${obj["version"]}`);
  }
  if (!obj["nodes"] || typeof obj["nodes"] !== "object") {
    throw new Error("Invalid .ltex file: missing nodes");
  }
  if (typeof obj["rootId"] !== "string") {
    throw new Error("Invalid .ltex file: missing rootId");
  }

  return obj as unknown as DocumentTree;
}
