// ─── Node Identity ────────────────────────────────────────────────────────────

export type NodeID = string; // UUID v4

// ─── Node Types ───────────────────────────────────────────────────────────────

export type NodeType =
  // Structural
  | "document"
  | "chapter"
  | "section"
  | "subsection"
  | "subsubsection"
  | "appendix"
  // Content
  | "paragraph"
  | "equation_inline"
  | "equation_block"
  | "figure"
  | "table"
  | "list"
  | "list_item"
  | "algorithm"
  | "theorem"
  | "lemma"
  | "proof"
  | "definition"
  | "remark"
  | "corollary"
  | "code_block"
  | "verbatim"
  // Cross-reference
  | "label"
  | "ref"
  | "cite"
  | "footnote"
  // Metadata
  | "document_metadata"
  | "author"
  | "abstract"
  | "keywords";

// ─── Base ─────────────────────────────────────────────────────────────────────

export interface BaseNode {
  id: NodeID;
  type: NodeType;
  children?: NodeID[];
  metadata: Record<string, unknown>;
}

// ─── Structural Nodes ─────────────────────────────────────────────────────────

export interface DocumentNode extends BaseNode {
  type: "document";
  metadata: {
    title: string;
    authors: string[];
    date: string;
    documentClass: string;
    packages: string[];
    customCommands: Record<string, string>;
  };
}

export interface ChapterNode extends BaseNode {
  type: "chapter";
  metadata: { title: string; numbered: boolean };
}

export interface SectionNode extends BaseNode {
  type: "section";
  metadata: { title: string; numbered: boolean };
}

export interface SubsectionNode extends BaseNode {
  type: "subsection";
  metadata: { title: string; numbered: boolean };
}

export interface SubsubsectionNode extends BaseNode {
  type: "subsubsection";
  metadata: { title: string; numbered: boolean };
}

export interface AppendixNode extends BaseNode {
  type: "appendix";
  metadata: { title: string };
}

// ─── Content Nodes ────────────────────────────────────────────────────────────

export interface ParagraphNode extends BaseNode {
  type: "paragraph";
  metadata: { text: string };
}

export interface EquationInlineNode extends BaseNode {
  type: "equation_inline";
  metadata: { latex: string };
}

export interface EquationBlockNode extends BaseNode {
  type: "equation_block";
  metadata: { latex: string; numbered: boolean; label?: string };
}

export interface FigureNode extends BaseNode {
  type: "figure";
  metadata: {
    assetHash: string;
    caption: string;
    label: string;
    width?: string;
    placement?: string;
  };
}

export interface TableNode extends BaseNode {
  type: "table";
  metadata: {
    data: string[][];
    headers: string[];
    caption: string;
    label: string;
    columnSpec?: string;
  };
}

export interface ListNode extends BaseNode {
  type: "list";
  metadata: { ordered: boolean };
}

export interface ListItemNode extends BaseNode {
  type: "list_item";
  metadata: { text: string };
}

export interface AlgorithmNode extends BaseNode {
  type: "algorithm";
  metadata: { caption: string; label: string; content: string };
}

export interface TheoremNode extends BaseNode {
  type: "theorem";
  metadata: { title?: string; label: string; content: string };
}

export interface LemmaNode extends BaseNode {
  type: "lemma";
  metadata: { title?: string; label: string; content: string };
}

export interface ProofNode extends BaseNode {
  type: "proof";
  metadata: { content: string };
}

export interface DefinitionNode extends BaseNode {
  type: "definition";
  metadata: { title?: string; label: string; content: string };
}

export interface RemarkNode extends BaseNode {
  type: "remark";
  metadata: { content: string };
}

export interface CorollaryNode extends BaseNode {
  type: "corollary";
  metadata: { title?: string; label: string; content: string };
}

export interface CodeBlockNode extends BaseNode {
  type: "code_block";
  metadata: { language: string; code: string; caption?: string };
}

export interface VerbatimNode extends BaseNode {
  type: "verbatim";
  metadata: { content: string };
}

// ─── Cross-Reference Nodes ────────────────────────────────────────────────────

export interface LabelNode extends BaseNode {
  type: "label";
  metadata: { key: string };
}

export interface RefNode extends BaseNode {
  type: "ref";
  metadata: { targetLabel: string };
}

export interface CiteNode extends BaseNode {
  type: "cite";
  metadata: { keys: string[]; note?: string };
}

export interface FootnoteNode extends BaseNode {
  type: "footnote";
  metadata: { content: string };
}

// ─── Metadata Nodes ───────────────────────────────────────────────────────────

export interface DocumentMetadataNode extends BaseNode {
  type: "document_metadata";
  metadata: Record<string, unknown>;
}

export interface AuthorNode extends BaseNode {
  type: "author";
  metadata: { name: string; affiliation?: string; email?: string };
}

export interface AbstractNode extends BaseNode {
  type: "abstract";
  metadata: { content: string };
}

export interface KeywordsNode extends BaseNode {
  type: "keywords";
  metadata: { words: string[] };
}

// ─── Union ────────────────────────────────────────────────────────────────────

export type AnyNode =
  | DocumentNode
  | ChapterNode
  | SectionNode
  | SubsectionNode
  | SubsubsectionNode
  | AppendixNode
  | ParagraphNode
  | EquationInlineNode
  | EquationBlockNode
  | FigureNode
  | TableNode
  | ListNode
  | ListItemNode
  | AlgorithmNode
  | TheoremNode
  | LemmaNode
  | ProofNode
  | DefinitionNode
  | RemarkNode
  | CorollaryNode
  | CodeBlockNode
  | VerbatimNode
  | LabelNode
  | RefNode
  | CiteNode
  | FootnoteNode
  | DocumentMetadataNode
  | AuthorNode
  | AbstractNode
  | KeywordsNode;

// ─── Asset & Bib types (referenced by DocumentTree) ──────────────────────────

export interface Asset {
  hash: string; // SHA-256 content hash, used as key
  filename: string;
  mimeType: string;
  dataUrl: string; // base64 data URL stored in IndexedDB
  sizeBytes: number;
}

export interface BibEntry {
  key: string;
  type: string; // article, book, inproceedings, …
  fields: Record<string, string>;
}

export interface AssetManifest {
  assets: Record<string, Asset>; // keyed by hash
}

export interface BibStore {
  entries: Record<string, BibEntry>; // keyed by cite key
}

// ─── Document Tree ────────────────────────────────────────────────────────────

export interface DocumentTree {
  version: number;
  nodes: Record<NodeID, AnyNode>;
  rootId: NodeID;
  assets: AssetManifest;
  bib: BibStore;
}
