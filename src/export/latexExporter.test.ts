import { describe, it, expect } from "vitest";
import { exportSingleFile, exportMultiFile } from "./latexExporter";
import { createNode } from "@/model/nodeRegistry";
import type { DocumentTree, DocumentNode, AnyNode } from "@/model/nodes";

// ─── Helper ───────────────────────────────────────────────────────────────────

let counter = 0;
function uid(): string {
  return `n${++counter}`;
}

function makeTree(
  overrideMeta?: Partial<DocumentNode["metadata"]>,
  children: AnyNode[] = [],
): DocumentTree {
  const rootId = uid();
  const root = createNode("document", rootId) as DocumentNode;
  if (overrideMeta) {
    Object.assign(root.metadata, overrideMeta);
  }

  const nodes: Record<string, AnyNode> = { [rootId]: root };
  root.children = [];

  for (const child of children) {
    nodes[child.id] = child;
    root.children.push(child.id);
  }

  return {
    version: 1,
    nodes,
    rootId,
    assets: { assets: {} },
    bib: { entries: {} },
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("exportSingleFile", () => {
  it("produces a valid LaTeX skeleton for an empty document", () => {
    const tree = makeTree({ title: "Test Doc", authors: ["Alice"] });
    const tex = exportSingleFile(tree);
    expect(tex).toContain("\\documentclass{article}");
    expect(tex).toContain("\\title{Test Doc}");
    expect(tex).toContain("\\author{Alice}");
    expect(tex).toContain("\\begin{document}");
    expect(tex).toContain("\\maketitle");
    expect(tex).toContain("\\end{document}");
  });

  it("serializes a paragraph node", () => {
    const para = createNode("paragraph", uid());
    (para as AnyNode & { metadata: { text: string } }).metadata.text = "Hello world.";
    const tree = makeTree({}, [para]);
    const tex = exportSingleFile(tree);
    expect(tex).toContain("Hello world.");
  });

  it("serializes an equation_block node", () => {
    const eq = createNode("equation_block", uid());
    (eq as AnyNode & { metadata: { latex: string; numbered: boolean } }).metadata.latex = "E = mc^2";
    (eq as AnyNode & { metadata: { latex: string; numbered: boolean } }).metadata.numbered = false;
    const tree = makeTree({}, [eq]);
    const tex = exportSingleFile(tree);
    expect(tex).toContain("\\begin{equation*}");
    expect(tex).toContain("E = mc^2");
    expect(tex).toContain("\\end{equation*}");
  });

  it("serializes a numbered equation with label", () => {
    const eq = createNode("equation_block", uid());
    Object.assign(eq.metadata, { latex: "a^2 + b^2 = c^2", numbered: true, label: "eq:pythagorean" });
    const tree = makeTree({}, [eq]);
    const tex = exportSingleFile(tree);
    expect(tex).toContain("\\begin{equation}");
    expect(tex).toContain("\\label{eq:pythagorean}");
  });

  it("serializes a figure node", () => {
    const fig = createNode("figure", uid());
    Object.assign(fig.metadata, { assetHash: "abc123", caption: "My figure", label: "fig:mine" });
    const tree = makeTree({}, [fig]);
    const tex = exportSingleFile(tree);
    expect(tex).toContain("\\begin{figure}");
    expect(tex).toContain("\\includegraphics");
    expect(tex).toContain("\\caption{My figure}");
    expect(tex).toContain("\\label{fig:mine}");
  });

  it("serializes a table node", () => {
    const tbl = createNode("table", uid());
    Object.assign(tbl.metadata, {
      headers: ["A", "B"],
      data: [["1", "2"], ["3", "4"]],
      caption: "Data",
      label: "tab:data",
    });
    const tree = makeTree({}, [tbl]);
    const tex = exportSingleFile(tree);
    expect(tex).toContain("\\begin{table}");
    expect(tex).toContain("\\toprule");
    expect(tex).toContain("\\midrule");
    expect(tex).toContain("\\bottomrule");
  });

  it("serializes a section with paragraph child", () => {
    const section = createNode("section", uid());
    (section as AnyNode & { metadata: { title: string; numbered: boolean } }).metadata.title = "Intro";
    const para = createNode("paragraph", uid());
    (para as AnyNode & { metadata: { text: string } }).metadata.text = "Section body.";
    section.children = [para.id];
    const tree = makeTree({}, [section]);
    tree.nodes[para.id] = para;
    const tex = exportSingleFile(tree);
    expect(tex).toContain("\\section{Intro}");
    expect(tex).toContain("Section body.");
  });

  it("serializes a code_block node", () => {
    const cb = createNode("code_block", uid());
    Object.assign(cb.metadata, { language: "python", code: "print('hello')" });
    const tree = makeTree({}, [cb]);
    const tex = exportSingleFile(tree);
    expect(tex).toContain("\\begin{lstlisting}[language=python]");
    expect(tex).toContain("print('hello')");
  });

  it("serializes a list node", () => {
    const list = createNode("list", uid());
    const item1 = createNode("list_item", uid());
    const item2 = createNode("list_item", uid());
    (item1 as AnyNode & { metadata: { text: string } }).metadata.text = "First";
    (item2 as AnyNode & { metadata: { text: string } }).metadata.text = "Second";
    list.children = [item1.id, item2.id];
    const tree = makeTree({}, [list]);
    tree.nodes[item1.id] = item1;
    tree.nodes[item2.id] = item2;
    const tex = exportSingleFile(tree);
    expect(tex).toContain("\\begin{itemize}");
    expect(tex).toContain("\\item First");
    expect(tex).toContain("\\item Second");
  });

  it("serializes a theorem node", () => {
    const thm = createNode("theorem", uid());
    Object.assign(thm.metadata, { label: "thm:main", content: "There exists..." });
    const tree = makeTree({}, [thm]);
    const tex = exportSingleFile(tree);
    expect(tex).toContain("\\begin{theorem}");
    expect(tex).toContain("\\label{thm:main}");
  });

  it("infers amsmath package for equation nodes", () => {
    const eq = createNode("equation_block", uid());
    const tree = makeTree({}, [eq]);
    const tex = exportSingleFile(tree);
    expect(tex).toContain("\\usepackage{amsmath}");
  });

  it("infers graphicx package for figure nodes", () => {
    const fig = createNode("figure", uid());
    const tree = makeTree({}, [fig]);
    const tex = exportSingleFile(tree);
    expect(tex).toContain("\\usepackage{graphicx}");
  });

  it("resolves label collisions automatically", () => {
    const eq1 = createNode("equation_block", uid());
    Object.assign(eq1.metadata, { latex: "x", numbered: true, label: "eq:same" });
    const eq2 = createNode("equation_block", uid());
    Object.assign(eq2.metadata, { latex: "y", numbered: true, label: "eq:same" });
    const tree = makeTree({}, [eq1, eq2]);
    const tex = exportSingleFile(tree);
    // Both labels should appear but be unique
    const labels = [...tex.matchAll(/\\label\{([^}]+)\}/g)].map((m) => m[1]);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("escapes special LaTeX characters in title", () => {
    const tree = makeTree({ title: "Test & Debug" });
    const tex = exportSingleFile(tree);
    expect(tex).toContain("Test \\& Debug");
  });
});

describe("exportMultiFile", () => {
  it("produces main.tex for a document with no chapters", () => {
    const tree = makeTree({ title: "Doc" });
    const files = exportMultiFile(tree);
    expect("main.tex" in files).toBe(true);
    expect(files["main.tex"]).toContain("\\documentclass");
  });

  it("splits chapters into separate files", () => {
    const ch1 = createNode("chapter", uid());
    (ch1 as AnyNode & { metadata: { title: string; numbered: boolean } }).metadata.title = "Intro";
    const ch2 = createNode("chapter", uid());
    (ch2 as AnyNode & { metadata: { title: string; numbered: boolean } }).metadata.title = "Methods";
    const tree = makeTree({}, [ch1, ch2]);
    const files = exportMultiFile(tree);
    expect("chapter1.tex" in files).toBe(true);
    expect("chapter2.tex" in files).toBe(true);
    expect(files["main.tex"]).toContain("\\input{chapter1.tex}");
    expect(files["main.tex"]).toContain("\\input{chapter2.tex}");
  });
});
