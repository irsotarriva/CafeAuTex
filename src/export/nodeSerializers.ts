import type {
  AnyNode,
  DocumentTree,
  NodeID,
  ChapterNode,
  SectionNode,
  SubsectionNode,
  SubsubsectionNode,
  AppendixNode,
  ParagraphNode,
  EquationInlineNode,
  EquationBlockNode,
  FigureNode,
  TableNode,
  ListNode,
  ListItemNode,
  AlgorithmNode,
  TheoremNode,
  LemmaNode,
  ProofNode,
  DefinitionNode,
  RemarkNode,
  CorollaryNode,
  CodeBlockNode,
  VerbatimNode,
  LabelNode,
  RefNode,
  CiteNode,
  FootnoteNode,
  AbstractNode,
  KeywordsNode,
  AuthorNode,
} from "@/model/nodes";
import { escapeTex } from "./preambleBuilder";
import type { LabelRegistry } from "./labelRegistry";

export interface SerializerContext {
  tree: DocumentTree;
  labelRegistry: LabelRegistry;
}

export function serializeNode(node: AnyNode, ctx: SerializerContext, indent = 0): string {
  const pad = "  ".repeat(indent);

  switch (node.type) {
    case "document":
      return serializeChildren(node.children ?? [], ctx, indent);

    case "chapter":
      return serializeHeading("chapter", node as ChapterNode, ctx, indent);

    case "section":
      return serializeHeading("section", node as SectionNode, ctx, indent);

    case "subsection":
      return serializeHeading("subsection", node as SubsectionNode, ctx, indent);

    case "subsubsection":
      return serializeHeading("subsubsection", node as SubsubsectionNode, ctx, indent);

    case "appendix":
      return `${pad}\\appendix\n${pad}\\section{${escapeTex((node as AppendixNode).metadata.title)}}\n`;

    case "paragraph":
      return `${pad}${escapeTex((node as ParagraphNode).metadata.text)}\n\n`;

    case "equation_inline":
      return `$${(node as EquationInlineNode).metadata.latex}$`;

    case "equation_block": {
      const eq = node as EquationBlockNode;
      const env = eq.metadata.numbered ? "equation" : "equation*";
      const label = eq.metadata.label
        ? `\n${pad}  \\label{${ctx.labelRegistry.register(eq.metadata.label)}}`
        : "";
      return `${pad}\\begin{${env}}${label}\n${pad}  ${eq.metadata.latex}\n${pad}\\end{${env}}\n\n`;
    }

    case "figure": {
      const fig = node as FigureNode;
      const label = ctx.labelRegistry.register(fig.metadata.label || `fig:${fig.id.slice(0, 6)}`);
      return (
        `${pad}\\begin{figure}[${fig.metadata.placement ?? "htbp"}]\n` +
        `${pad}  \\centering\n` +
        `${pad}  \\includegraphics[width=${fig.metadata.width ?? "0.8\\linewidth"}]{${fig.metadata.assetHash}}\n` +
        `${pad}  \\caption{${escapeTex(fig.metadata.caption)}}\n` +
        `${pad}  \\label{${label}}\n` +
        `${pad}\\end{figure}\n\n`
      );
    }

    case "table": {
      const tbl = node as TableNode;
      const label = ctx.labelRegistry.register(tbl.metadata.label || `tab:${tbl.id.slice(0, 6)}`);
      const colCount = Math.max(
        tbl.metadata.headers.length,
        ...(tbl.metadata.data.map((r) => r.length)),
      );
      const colSpec = tbl.metadata.columnSpec ?? Array.from({ length: colCount }, () => "l").join(" ");
      const headerRow = tbl.metadata.headers.map(escapeTex).join(" & ");
      const bodyRows = tbl.metadata.data
        .map((row) => row.map(escapeTex).join(" & "))
        .join(" \\\\\n  ");
      return (
        `${pad}\\begin{table}[htbp]\n` +
        `${pad}  \\centering\n` +
        `${pad}  \\caption{${escapeTex(tbl.metadata.caption)}}\n` +
        `${pad}  \\label{${label}}\n` +
        `${pad}  \\begin{tabular}{${colSpec}}\n` +
        `${pad}    \\toprule\n` +
        `${pad}    ${headerRow} \\\\\n` +
        `${pad}    \\midrule\n` +
        `${pad}    ${bodyRows} \\\\\n` +
        `${pad}    \\bottomrule\n` +
        `${pad}  \\end{tabular}\n` +
        `${pad}\\end{table}\n\n`
      );
    }

    case "list": {
      const lst = node as ListNode;
      const env = lst.metadata.ordered ? "enumerate" : "itemize";
      const items = serializeChildren(lst.children ?? [], ctx, indent + 1);
      return `${pad}\\begin{${env}}\n${items}${pad}\\end{${env}}\n\n`;
    }

    case "list_item":
      return `${pad}\\item ${escapeTex((node as ListItemNode).metadata.text)}\n`;

    case "algorithm": {
      const alg = node as AlgorithmNode;
      const label = ctx.labelRegistry.register(alg.metadata.label || `alg:${alg.id.slice(0, 6)}`);
      return (
        `${pad}\\begin{algorithm}\n` +
        `${pad}  \\caption{${escapeTex(alg.metadata.caption)}}\n` +
        `${pad}  \\label{${label}}\n` +
        `${pad}  ${alg.metadata.content}\n` +
        `${pad}\\end{algorithm}\n\n`
      );
    }

    case "theorem":
      return serializeTheoremLike("theorem", node as TheoremNode, ctx, pad);
    case "lemma":
      return serializeTheoremLike("lemma", node as LemmaNode, ctx, pad);
    case "definition":
      return serializeTheoremLike("definition", node as DefinitionNode, ctx, pad);
    case "corollary":
      return serializeTheoremLike("corollary", node as CorollaryNode, ctx, pad);

    case "proof":
      return `${pad}\\begin{proof}\n${pad}  ${(node as ProofNode).metadata.content}\n${pad}\\end{proof}\n\n`;

    case "remark":
      return `${pad}\\begin{remark}\n${pad}  ${(node as RemarkNode).metadata.content}\n${pad}\\end{remark}\n\n`;

    case "code_block": {
      const cb = node as CodeBlockNode;
      return (
        `${pad}\\begin{lstlisting}[language=${cb.metadata.language}]\n` +
        `${cb.metadata.code}\n` +
        `${pad}\\end{lstlisting}\n\n`
      );
    }

    case "verbatim":
      return `${pad}\\begin{verbatim}\n${(node as VerbatimNode).metadata.content}\n${pad}\\end{verbatim}\n\n`;

    case "label":
      return `${pad}\\label{${ctx.labelRegistry.register((node as LabelNode).metadata.key)}}`;

    case "ref":
      return `\\ref{${(node as RefNode).metadata.targetLabel}}`;

    case "cite": {
      const cite = node as CiteNode;
      const keys = cite.metadata.keys.join(",");
      return cite.metadata.note ? `\\cite[${cite.metadata.note}]{${keys}}` : `\\cite{${keys}}`;
    }

    case "footnote":
      return `\\footnote{${escapeTex((node as FootnoteNode).metadata.content)}}`;

    case "abstract":
      return `${pad}\\begin{abstract}\n${pad}  ${escapeTex((node as AbstractNode).metadata.content)}\n${pad}\\end{abstract}\n\n`;

    case "keywords":
      return `${pad}\\keywords{${(node as KeywordsNode).metadata.words.map(escapeTex).join(", ")}}\n\n`;

    case "author":
      return `${pad}% author: ${escapeTex((node as AuthorNode).metadata.name)}\n`;

    case "document_metadata":
      return ""; // handled by preamble builder

    default:
      return "";
  }
}

function serializeChildren(children: NodeID[], ctx: SerializerContext, indent: number): string {
  return children
    .map((id) => {
      const child = ctx.tree.nodes[id];
      if (!child) return "";
      return serializeNode(child, ctx, indent);
    })
    .join("");
}

function serializeHeading(
  cmd: string,
  node: { metadata: { title: string; numbered: boolean }; children?: NodeID[] },
  ctx: SerializerContext,
  indent: number,
): string {
  const pad = "  ".repeat(indent);
  const star = node.metadata.numbered ? "" : "*";
  const children = serializeChildren(node.children ?? [], ctx, indent);
  return `${pad}\\${cmd}${star}{${escapeTex(node.metadata.title)}}\n${children}`;
}

function serializeTheoremLike(
  env: string,
  node: { id: string; metadata: { title?: string; label: string; content: string } },
  ctx: SerializerContext,
  pad: string,
): string {
  const title = node.metadata.title ? `[${escapeTex(node.metadata.title)}]` : "";
  const label = ctx.labelRegistry.register(node.metadata.label || `${env}:${node.id.slice(0, 6)}`);
  return (
    `${pad}\\begin{${env}}${title}\n` +
    `${pad}  \\label{${label}}\n` +
    `${pad}  ${node.metadata.content}\n` +
    `${pad}\\end{${env}}\n\n`
  );
}
