import type { AnyNode, NodeType } from "./nodes";

type NodeFactory = () => Omit<AnyNode, "id">;

const registry: Record<NodeType, NodeFactory> = {
  document: () => ({
    type: "document",
    children: [],
    metadata: {
      title: "Untitled Document",
      authors: [],
      date: new Date().toISOString().slice(0, 10),
      documentClass: "article",
      packages: [],
      customCommands: {},
    },
  }),
  chapter: () => ({
    type: "chapter",
    children: [],
    metadata: { title: "Chapter", numbered: true },
  }),
  section: () => ({
    type: "section",
    children: [],
    metadata: { title: "Section", numbered: true },
  }),
  subsection: () => ({
    type: "subsection",
    children: [],
    metadata: { title: "Subsection", numbered: true },
  }),
  subsubsection: () => ({
    type: "subsubsection",
    children: [],
    metadata: { title: "Subsubsection", numbered: true },
  }),
  appendix: () => ({
    type: "appendix",
    children: [],
    metadata: { title: "Appendix" },
  }),
  paragraph: () => ({
    type: "paragraph",
    metadata: { text: "" },
  }),
  equation_inline: () => ({
    type: "equation_inline",
    metadata: { latex: "" },
  }),
  equation_block: () => ({
    type: "equation_block",
    metadata: { latex: "", numbered: false },
  }),
  figure: () => ({
    type: "figure",
    metadata: { assetHash: "", caption: "", label: "", width: "0.8\\linewidth", placement: "htbp" },
  }),
  table: () => ({
    type: "table",
    metadata: { data: [[""]], headers: [""], caption: "", label: "" },
  }),
  list: () => ({
    type: "list",
    children: [],
    metadata: { ordered: false },
  }),
  list_item: () => ({
    type: "list_item",
    metadata: { text: "" },
  }),
  algorithm: () => ({
    type: "algorithm",
    metadata: { caption: "", label: "", content: "" },
  }),
  theorem: () => ({
    type: "theorem",
    metadata: { label: "", content: "" },
  }),
  lemma: () => ({
    type: "lemma",
    metadata: { label: "", content: "" },
  }),
  proof: () => ({
    type: "proof",
    metadata: { content: "" },
  }),
  definition: () => ({
    type: "definition",
    metadata: { label: "", content: "" },
  }),
  remark: () => ({
    type: "remark",
    metadata: { content: "" },
  }),
  corollary: () => ({
    type: "corollary",
    metadata: { label: "", content: "" },
  }),
  code_block: () => ({
    type: "code_block",
    metadata: { language: "text", code: "" },
  }),
  verbatim: () => ({
    type: "verbatim",
    metadata: { content: "" },
  }),
  label: () => ({
    type: "label",
    metadata: { key: "" },
  }),
  ref: () => ({
    type: "ref",
    metadata: { targetLabel: "" },
  }),
  cite: () => ({
    type: "cite",
    metadata: { keys: [] },
  }),
  footnote: () => ({
    type: "footnote",
    metadata: { content: "" },
  }),
  document_metadata: () => ({
    type: "document_metadata",
    metadata: {},
  }),
  author: () => ({
    type: "author",
    metadata: { name: "" },
  }),
  abstract: () => ({
    type: "abstract",
    metadata: { content: "" },
  }),
  keywords: () => ({
    type: "keywords",
    metadata: { words: [] },
  }),
};

export function createNode(type: NodeType, id: string): AnyNode {
  const factory = registry[type];
  return { id, ...factory() } as AnyNode;
}

export function getNodeTypes(): NodeType[] {
  return Object.keys(registry) as NodeType[];
}
