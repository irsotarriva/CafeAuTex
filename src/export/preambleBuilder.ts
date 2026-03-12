import type { DocumentNode } from "@/model/nodes";

interface PreambleOptions {
  documentClass: string;
  packages: string[];
  customCommands: Record<string, string>;
}

export function buildPreamble(options: PreambleOptions): string {
  const { documentClass, packages, customCommands } = options;
  const lines: string[] = [];

  lines.push(`\\documentclass{${documentClass}}`);
  lines.push("");

  // Standard encoding options
  lines.push("\\usepackage[utf8]{inputenc}");
  lines.push("\\usepackage[T1]{fontenc}");

  // Other packages (skip inputenc/fontenc since already added with options)
  for (const pkg of packages) {
    if (pkg === "inputenc" || pkg === "fontenc") continue;
    if (pkg === "hyperref") {
      // hyperref should be loaded last
      continue;
    }
    lines.push(`\\usepackage{${pkg}}`);
  }

  // hyperref last
  if (packages.includes("hyperref")) {
    lines.push("\\usepackage[colorlinks=true,linkcolor=blue,citecolor=blue]{hyperref}");
  }

  if (Object.keys(customCommands).length > 0) {
    lines.push("");
    for (const [name, def] of Object.entries(customCommands)) {
      lines.push(`\\newcommand{${name}}{${def}}`);
    }
  }

  return lines.join("\n");
}

export function buildDocumentMeta(doc: DocumentNode): string {
  const { title, authors, date } = doc.metadata;
  const lines: string[] = [];
  lines.push(`\\title{${escapeTex(title)}}`);
  if (authors.length > 0) {
    lines.push(`\\author{${authors.map(escapeTex).join(" \\and ")}}`);
  }
  lines.push(`\\date{${date ? escapeTex(date) : "\\today"}}`);
  return lines.join("\n");
}

export function escapeTex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[&%$#_{}]/g, (c) => `\\${c}`)
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/~/g, "\\textasciitilde{}");
}
