import { Schema } from "prosemirror-model";
import type { NodeSpec, MarkSpec } from "prosemirror-model";

// Each ProseMirror node carries a `nodeId` attribute so changes can be
// traced back to the Zustand document tree node.

function withNodeId(spec: NodeSpec): NodeSpec {
  return {
    ...spec,
    attrs: {
      ...(spec.attrs ?? {}),
      nodeId: { default: "" },
    },
  };
}

const nodes: Record<string, NodeSpec> = {
  // ── Root ────────────────────────────────────────────────────────────────────
  doc: {
    content: "block+",
  },

  // ── Structural blocks ────────────────────────────────────────────────────────
  paragraph: withNodeId({
    group: "block",
    content: "inline*",
    parseDOM: [{ tag: "p" }],
    toDOM: (node) => ["p", { "data-node-id": node.attrs["nodeId"] as string }, 0],
  }),

  heading: withNodeId({
    group: "block",
    content: "inline*",
    attrs: { level: { default: 1 }, nodeId: { default: "" } },
    defining: true,
    parseDOM: [
      { tag: "h1", attrs: { level: 1 } },
      { tag: "h2", attrs: { level: 2 } },
      { tag: "h3", attrs: { level: 3 } },
      { tag: "h4", attrs: { level: 4 } },
    ],
    toDOM: (node) => [
      `h${node.attrs["level"] as number}`,
      { "data-node-id": node.attrs["nodeId"] as string },
      0,
    ],
  }),

  // ── Block equation ────────────────────────────────────────────────────────────
  equation_block: withNodeId({
    group: "block",
    atom: true,
    attrs: { latex: { default: "" }, numbered: { default: false }, nodeId: { default: "" } },
    parseDOM: [{ tag: "div.equation-block" }],
    toDOM: (node) => [
      "div",
      {
        class: "equation-block",
        "data-latex": node.attrs["latex"] as string,
        "data-node-id": node.attrs["nodeId"] as string,
      },
    ],
  }),

  // ── Figure placeholder ────────────────────────────────────────────────────────
  figure: withNodeId({
    group: "block",
    atom: true,
    attrs: {
      assetHash: { default: "" },
      caption: { default: "" },
      label: { default: "" },
      nodeId: { default: "" },
    },
    parseDOM: [{ tag: "figure" }],
    toDOM: (node) => [
      "figure",
      { "data-node-id": node.attrs["nodeId"] as string },
    ],
  }),

  // ── Table ─────────────────────────────────────────────────────────────────────
  table: withNodeId({
    group: "block",
    atom: true,
    attrs: {
      headers: { default: [""] },
      data: { default: [[""]] },
      caption: { default: "" },
      label: { default: "" },
      nodeId: { default: "" },
    },
    parseDOM: [{ tag: "table" }],
    toDOM: (node) => [
      "table",
      { "data-node-id": node.attrs["nodeId"] as string },
    ],
  }),

  // ── Code block ────────────────────────────────────────────────────────────────
  code_block: withNodeId({
    group: "block",
    content: "text*",
    marks: "",
    code: true,
    attrs: { language: { default: "text" }, nodeId: { default: "" } },
    parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
    toDOM: (node) => [
      "pre",
      { "data-node-id": node.attrs["nodeId"] as string },
      ["code", { class: `language-${node.attrs["language"] as string}` }, 0],
    ],
  }),

  // ── List nodes ────────────────────────────────────────────────────────────────
  bullet_list: withNodeId({
    group: "block",
    content: "list_item+",
    parseDOM: [{ tag: "ul" }],
    toDOM: (node) => ["ul", { "data-node-id": node.attrs["nodeId"] as string }, 0],
  }),

  ordered_list: withNodeId({
    group: "block",
    content: "list_item+",
    attrs: { order: { default: 1 }, nodeId: { default: "" } },
    parseDOM: [{ tag: "ol" }],
    toDOM: (node) => ["ol", { "data-node-id": node.attrs["nodeId"] as string }, 0],
  }),

  list_item: withNodeId({
    content: "paragraph block*",
    parseDOM: [{ tag: "li" }],
    toDOM: () => ["li", 0],
  }),

  // ── Inline ────────────────────────────────────────────────────────────────────
  text: {
    group: "inline",
  },

  // ── Inline equation ───────────────────────────────────────────────────────────
  equation_inline: {
    group: "inline",
    inline: true,
    atom: true,
    attrs: {
      latex: { default: "" },
      nodeId: { default: "" },
    },
    parseDOM: [{ tag: "span.equation-inline" }],
    toDOM: (node) => [
      "span",
      {
        class: "equation-inline",
        "data-latex": node.attrs["latex"] as string,
        "data-node-id": node.attrs["nodeId"] as string,
      },
    ],
  },

  // ── Hard break ────────────────────────────────────────────────────────────────
  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{ tag: "br" }],
    toDOM: () => ["br"],
  },
};

const marks: Record<string, MarkSpec> = {
  strong: {
    parseDOM: [{ tag: "strong" }, { tag: "b" }],
    toDOM: () => ["strong", 0],
  },
  em: {
    parseDOM: [{ tag: "em" }, { tag: "i" }],
    toDOM: () => ["em", 0],
  },
  code: {
    parseDOM: [{ tag: "code" }],
    toDOM: () => ["code", 0],
  },
  underline: {
    parseDOM: [{ tag: "u" }],
    toDOM: () => ["u", 0],
  },
};

export const latexSchema = new Schema({ nodes, marks });
export type LatexSchema = typeof latexSchema;
