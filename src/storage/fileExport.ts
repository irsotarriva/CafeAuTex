import { serialize } from "@/model/serialization";
import { writeFile, saveFileDialog } from "@/tauri/commands";
import type { DocumentTree } from "@/model/nodes";

/**
 * Prompt the user for a save path and write the .ltex file to disk.
 * Returns the chosen path, or null if cancelled.
 */
export async function exportToFile(tree: DocumentTree): Promise<string | null> {
  const path = await saveFileDialog([
    { name: "LaTeX Project", extensions: ["ltex"] },
  ]);
  if (!path) return null;

  const filePath = path.endsWith(".ltex") ? path : `${path}.ltex`;
  await writeFile(filePath, serialize(tree));
  return filePath;
}
