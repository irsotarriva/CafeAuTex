import type { DocumentTree, DocumentNode, NodeID } from "@/model/nodes";
import { inferPackages } from "./packageInference";
import { buildPreamble, buildDocumentMeta } from "./preambleBuilder";
import { LabelRegistry } from "./labelRegistry";
import { serializeNode } from "./nodeSerializers";

export type FileMap = Record<string, string>; // filename → content

// ─── Single-file export ───────────────────────────────────────────────────────

export function exportSingleFile(tree: DocumentTree): string {
  const root = tree.nodes[tree.rootId] as DocumentNode | undefined;
  if (!root || root.type !== "document") {
    throw new Error("Tree root is not a document node");
  }

  const packages = [
    ...inferPackages(tree),
    ...root.metadata.packages,
  ];
  const uniquePackages = Array.from(new Set(packages));

  const preamble = buildPreamble({
    documentClass: root.metadata.documentClass,
    packages: uniquePackages,
    customCommands: root.metadata.customCommands,
  });
  const meta = buildDocumentMeta(root);

  const labelRegistry = new LabelRegistry();
  const ctx = { tree, labelRegistry };

  // Body: serialize all children of root
  const body = (root.children ?? [])
    .map((id) => {
      const node = tree.nodes[id];
      if (!node) return "";
      return serializeNode(node, ctx, 0);
    })
    .join("");

  return [
    preamble,
    "",
    meta,
    "",
    "\\begin{document}",
    "\\maketitle",
    "",
    body.trimEnd(),
    "",
    "\\end{document}",
  ].join("\n");
}

// ─── Multi-file export ────────────────────────────────────────────────────────

/**
 * Splits the document into one .tex file per chapter/appendix.
 * Returns a map of { filename: content }.
 * The root file is always "main.tex".
 */
export function exportMultiFile(tree: DocumentTree): FileMap {
  const root = tree.nodes[tree.rootId] as DocumentNode | undefined;
  if (!root || root.type !== "document") {
    throw new Error("Tree root is not a document node");
  }

  const packages = [
    ...inferPackages(tree),
    ...root.metadata.packages,
  ];
  const uniquePackages = Array.from(new Set(packages));

  const preamble = buildPreamble({
    documentClass: root.metadata.documentClass,
    packages: uniquePackages,
    customCommands: root.metadata.customCommands,
  });
  const meta = buildDocumentMeta(root);

  const labelRegistry = new LabelRegistry();
  const ctx = { tree, labelRegistry };

  const files: FileMap = {};
  const inputLines: string[] = [];
  let chapterIndex = 0;

  const nonChapterNodes: NodeID[] = [];

  for (const childId of root.children ?? []) {
    const child = tree.nodes[childId];
    if (!child) continue;
    if (child.type === "chapter" || child.type === "appendix") {
      chapterIndex++;
      const filename = `chapter${chapterIndex}.tex`;
      files[filename] = serializeNode(child, ctx, 0);
      inputLines.push(`\\input{${filename}}`);
    } else {
      nonChapterNodes.push(childId);
    }
  }

  // Non-chapter top-level content (abstract, etc.) goes inline in main.tex
  const inlineBody = nonChapterNodes
    .map((id) => {
      const node = tree.nodes[id];
      if (!node) return "";
      return serializeNode(node, ctx, 0);
    })
    .join("");

  files["main.tex"] = [
    preamble,
    "",
    meta,
    "",
    "\\begin{document}",
    "\\maketitle",
    "",
    inlineBody.trimEnd(),
    ...inputLines,
    "",
    "\\end{document}",
  ].join("\n");

  return files;
}
