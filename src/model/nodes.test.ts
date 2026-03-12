import { describe, it, expect } from "vitest";
import { serialize, deserialize } from "./serialization";
import { validateTree } from "./validation";
import { createNode } from "./nodeRegistry";
import type { DocumentTree, NodeType, AnyNode } from "./nodes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

let counter = 0;
function uid(): string {
  return `test-node-${++counter}`;
}

function makeMinimalTree(): DocumentTree {
  const rootId = uid();
  const root = createNode("document", rootId);
  return {
    version: 1,
    nodes: { [rootId]: root },
    rootId,
    assets: { assets: {} },
    bib: { entries: {} },
  };
}

// ─── Serialization round-trip ─────────────────────────────────────────────────

describe("serialization", () => {
  it("round-trips a minimal document tree", () => {
    const tree = makeMinimalTree();
    const json = serialize(tree);
    const restored = deserialize(json);
    expect(restored.rootId).toBe(tree.rootId);
    expect(Object.keys(restored.nodes)).toEqual(Object.keys(tree.nodes));
  });

  it("throws on invalid JSON", () => {
    expect(() => deserialize("not-json")).toThrow();
  });

  it("throws on wrong version", () => {
    const tree = makeMinimalTree();
    const json = JSON.stringify({ ...tree, version: 99 });
    expect(() => deserialize(json)).toThrow(/Unsupported .ltex version/);
  });

  it("throws when rootId is missing", () => {
    const tree = makeMinimalTree();
    const json = JSON.stringify({ ...tree, rootId: undefined });
    expect(() => deserialize(json)).toThrow(/missing rootId/);
  });
});

// ─── Round-trip for every node type ──────────────────────────────────────────

const ALL_NODE_TYPES: NodeType[] = [
  "document",
  "chapter",
  "section",
  "subsection",
  "subsubsection",
  "appendix",
  "paragraph",
  "equation_inline",
  "equation_block",
  "figure",
  "table",
  "list",
  "list_item",
  "algorithm",
  "theorem",
  "lemma",
  "proof",
  "definition",
  "remark",
  "corollary",
  "code_block",
  "verbatim",
  "label",
  "ref",
  "cite",
  "footnote",
  "document_metadata",
  "author",
  "abstract",
  "keywords",
];

describe("nodeRegistry + serialization round-trip for every NodeType", () => {
  for (const type of ALL_NODE_TYPES) {
    it(`round-trips "${type}" node`, () => {
      const rootId = uid();
      const root = createNode("document", rootId);

      const nodeId = uid();
      const node = createNode(type, nodeId);

      // Attach node as child of root (even if structurally odd — just for storage test)
      (root as AnyNode & { children?: string[] }).children = [nodeId];

      const tree: DocumentTree = {
        version: 1,
        nodes: { [rootId]: root, [nodeId]: node },
        rootId,
        assets: { assets: {} },
        bib: { entries: {} },
      };

      const restored = deserialize(serialize(tree));
      const restoredNode = restored.nodes[nodeId];
      expect(restoredNode).toBeDefined();
      expect(restoredNode!.type).toBe(type);
      expect(restoredNode!.id).toBe(nodeId);
      // Metadata keys survive round-trip
      expect(Object.keys(restoredNode!.metadata)).toEqual(
        Object.keys(node.metadata),
      );
    });
  }
});

// ─── Validation ───────────────────────────────────────────────────────────────

describe("validateTree", () => {
  it("accepts a valid tree", () => {
    const tree = makeMinimalTree();
    const result = validateTree(tree);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("catches missing root node", () => {
    const tree = makeMinimalTree();
    tree.rootId = "nonexistent";
    const result = validateTree(tree);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("not found"))).toBe(true);
  });

  it("catches orphaned nodes", () => {
    const tree = makeMinimalTree();
    const orphanId = uid();
    const orphan = createNode("paragraph", orphanId);
    tree.nodes[orphanId] = orphan;
    const result = validateTree(tree);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("orphan"))).toBe(true);
  });

  it("catches broken child references", () => {
    const tree = makeMinimalTree();
    const root = tree.nodes[tree.rootId]!;
    root.children = ["ghost-id"];
    const result = validateTree(tree);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("ghost-id"))).toBe(true);
  });

  it("catches non-document root", () => {
    const rootId = uid();
    const root = createNode("paragraph", rootId);
    const tree: DocumentTree = {
      version: 1,
      nodes: { [rootId]: root },
      rootId,
      assets: { assets: {} },
      bib: { entries: {} },
    };
    const result = validateTree(tree);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("document"))).toBe(true);
  });
});
