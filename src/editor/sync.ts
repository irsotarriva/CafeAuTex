/**
 * Bidirectional sync between the ProseMirror document and the Zustand
 * document store.
 *
 * ProseMirror is the editing surface. Each PM node carries a `nodeId`
 * attribute that links it back to the corresponding node in the Zustand tree.
 *
 * Flow:
 *   PM Transaction  →  extractUpdates()  →  documentStore.dispatch()
 *   Zustand state   →  treeToDoc()        →  EditorView.updateState()
 */

import { EditorState, type Transaction } from "prosemirror-state";
import { Node as PmNode } from "prosemirror-model";
import { latexSchema } from "./schema";
import type { DocumentTree } from "@/model/nodes";
import type { DocumentAction } from "@/store/documentStore";

// ─── Tree → ProseMirror document ──────────────────────────────────────────────

/**
 * Converts a Zustand DocumentTree into a ProseMirror Document node.
 * This is called when the Zustand store changes externally (e.g. after load).
 */
export function treeToDoc(tree: DocumentTree): PmNode {
  const root = tree.nodes[tree.rootId];
  if (!root) {
    return latexSchema.node("doc", null, [
      latexSchema.node("paragraph", { nodeId: "" }, []),
    ]);
  }

  const children: PmNode[] = (root.children ?? [])
    .map((id) => {
      const node = tree.nodes[id];
      if (!node) return null;
      return nodeToPm(node, tree);
    })
    .filter((n): n is PmNode => n !== null);

  if (children.length === 0) {
    children.push(latexSchema.node("paragraph", { nodeId: "" }, []));
  }

  return latexSchema.node("doc", null, children);
}

function nodeToPm(node: { id: string; type: string; children?: string[]; metadata: Record<string, unknown> }, tree: DocumentTree): PmNode | null {
  const { id, type, metadata } = node;

  switch (type) {
    case "paragraph":
      return latexSchema.node("paragraph", { nodeId: id }, [
        latexSchema.text((metadata["text"] as string) || ""),
      ]);

    case "section":
    case "subsection":
    case "subsubsection":
    case "chapter":
    case "appendix": {
      const levelMap: Record<string, number> = {
        chapter: 1, section: 2, subsection: 3, subsubsection: 4, appendix: 1,
      };
      const children = (node.children ?? [])
        .map((cid) => {
          const c = tree.nodes[cid];
          return c ? nodeToPm(c, tree) : null;
        })
        .filter((n): n is PmNode => n !== null);
      const headingContent = latexSchema.text((metadata["title"] as string) || "");
      const heading = latexSchema.node("heading", { nodeId: id, level: levelMap[type] ?? 2 }, [headingContent]);
      return latexSchema.node("doc", null, [heading, ...children]);
    }

    case "equation_block":
      return latexSchema.node("equation_block", {
        nodeId: id,
        latex: metadata["latex"] as string,
        numbered: metadata["numbered"] as boolean,
      });

    case "equation_inline":
      return latexSchema.node("equation_inline", {
        nodeId: id,
        latex: metadata["latex"] as string,
      });

    case "code_block":
      return latexSchema.node("code_block", {
        nodeId: id,
        language: (metadata["language"] as string) || "text",
      }, [
        latexSchema.text((metadata["code"] as string) || ""),
      ]);

    case "figure":
      return latexSchema.node("figure", {
        nodeId: id,
        assetHash: metadata["assetHash"] as string,
        caption: metadata["caption"] as string,
        label: metadata["label"] as string,
      });

    case "table":
      return latexSchema.node("table", {
        nodeId: id,
        headers: metadata["headers"] as string[],
        data: metadata["data"] as string[][],
        caption: metadata["caption"] as string,
        label: metadata["label"] as string,
      });

    default:
      // Unsupported node type — render as placeholder paragraph
      return latexSchema.node("paragraph", { nodeId: id }, [
        latexSchema.text(`[${type}]`),
      ]);
  }
}

// ─── ProseMirror transaction → Zustand actions ────────────────────────────────

/**
 * Extracts Zustand DocumentActions from a ProseMirror transaction.
 * Called in the EditorView's `dispatchTransaction` callback.
 */
export function extractActions(tr: Transaction): DocumentAction[] {
  const actions: DocumentAction[] = [];
  if (!tr.docChanged) return actions;

  // Walk the new doc and emit UPDATE_NODE for every changed node
  tr.doc.forEach((pmNode) => {
    const nodeId = pmNode.attrs["nodeId"] as string | undefined;
    if (!nodeId) return;

    switch (pmNode.type.name) {
      case "paragraph":
        actions.push({
          type: "UPDATE_NODE",
          id: nodeId,
          patch: { metadata: { text: pmNode.textContent } } as never,
        });
        break;

      case "equation_block":
        actions.push({
          type: "UPDATE_NODE",
          id: nodeId,
          patch: {
            metadata: {
              latex: pmNode.attrs["latex"] as string,
              numbered: pmNode.attrs["numbered"] as boolean,
            },
          } as never,
        });
        break;

      case "code_block":
        actions.push({
          type: "UPDATE_NODE",
          id: nodeId,
          patch: {
            metadata: {
              language: pmNode.attrs["language"] as string,
              code: pmNode.textContent,
            },
          } as never,
        });
        break;

      default:
        break;
    }
  });

  return actions;
}

// ─── Initial editor state ─────────────────────────────────────────────────────

export function createEditorState(tree: DocumentTree | null): EditorState {
  if (tree) {
    const doc = treeToDoc(tree);
    return EditorState.create({ schema: latexSchema, doc });
  }
  return EditorState.create({ schema: latexSchema });
}
