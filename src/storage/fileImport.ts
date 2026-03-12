import { readFile, openFileDialog } from "@/tauri/commands";
import { deserialize } from "@/model/serialization";
import type { DocumentTree, AnyNode } from "@/model/nodes";
import { createNode } from "@/model/nodeRegistry";

/**
 * Open a file dialog and import an .ltex or .tex file.
 * Returns the parsed DocumentTree, or null if cancelled.
 */
export async function importFromFile(): Promise<DocumentTree | null> {
  const path = await openFileDialog([
    { name: "LaTeX Project", extensions: ["ltex"] },
    { name: "LaTeX Source", extensions: ["tex"] },
  ]);
  if (!path) return null;

  const content = await readFile(path);

  if (path.endsWith(".ltex")) {
    return deserialize(content);
  }

  // Best-effort parse of raw .tex
  return importFromLatex(content);
}

/**
 * Best-effort heuristic parser: converts a raw .tex string into a DocumentTree.
 * Not perfect — creates a flat structure from section headings and paragraphs.
 */
export function importFromLatex(tex: string): DocumentTree {
  const rootId = crypto.randomUUID();
  const root = createNode("document", rootId);
  const nodes: Record<string, AnyNode> = { [rootId]: root };
  root.children = [];

  // Extract title
  const titleMatch = /\\title\{([^}]+)\}/.exec(tex);
  if (titleMatch?.[1] && root.type === "document") {
    (root.metadata as { title: string }).title = titleMatch[1];
  }

  // Extract authors
  const authorMatch = /\\author\{([^}]+)\}/.exec(tex);
  if (authorMatch?.[1] && root.type === "document") {
    (root.metadata as { authors: string[] }).authors = authorMatch[1]
      .split(/\\and/)
      .map((a) => a.trim())
      .filter(Boolean);
  }

  // Extract abstract
  const abstractMatch = /\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/.exec(tex);
  if (abstractMatch?.[1]) {
    const id = crypto.randomUUID();
    const node = createNode("abstract", id);
    (node.metadata as { content: string }).content = abstractMatch[1].trim();
    nodes[id] = node;
    root.children.push(id);
  }

  // Extract sections, subsections, and their content
  const sectionRe = /\\(chapter|section|subsection|subsubsection)\*?\{([^}]+)\}/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  const bodyStart = tex.indexOf("\\begin{document}");
  const bodyEnd = tex.indexOf("\\end{document}");
  const body = bodyStart >= 0 && bodyEnd >= 0
    ? tex.slice(bodyStart + "\\begin{document}".length, bodyEnd)
    : tex;

  while ((match = sectionRe.exec(body)) !== null) {
    const level = match[1] as "chapter" | "section" | "subsection" | "subsubsection";
    const title = match[2] ?? "";

    // Grab text before this heading as a paragraph
    const preceding = body.slice(lastIndex, match.index).trim();
    if (preceding) {
      const paraId = crypto.randomUUID();
      const para = createNode("paragraph", paraId);
      (para.metadata as { text: string }).text = preceding
        .replace(/\\maketitle/g, "")
        .trim();
      if ((para.metadata as { text: string }).text) {
        nodes[paraId] = para;
        root.children.push(paraId);
      }
    }

    const id = crypto.randomUUID();
    const node = createNode(level, id);
    (node.metadata as { title: string }).title = title;
    nodes[id] = node;
    root.children.push(id);
    lastIndex = match.index + match[0].length;
  }

  // Trailing content
  const trailing = body.slice(lastIndex).trim();
  if (trailing && !trailing.match(/^\\(end|bibliography|printbibliography)/)) {
    const paraId = crypto.randomUUID();
    const para = createNode("paragraph", paraId);
    (para.metadata as { text: string }).text = trailing;
    nodes[paraId] = para;
    root.children.push(paraId);
  }

  // If nothing was extracted, add an empty paragraph so the tree is valid
  if (root.children.length === 0) {
    const paraId = crypto.randomUUID();
    nodes[paraId] = createNode("paragraph", paraId);
    root.children.push(paraId);
  }

  return {
    version: 1,
    nodes,
    rootId,
    assets: { assets: {} },
    bib: { entries: {} },
  };
}
