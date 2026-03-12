import type { AnyNode, DocumentTree, NodeType } from "@/model/nodes";

/**
 * Scans all nodes in the tree and returns the set of LaTeX packages that
 * are required by the content.
 */
export function inferPackages(tree: DocumentTree): string[] {
  const packages = new Set<string>();

  // Always include these
  packages.add("inputenc");
  packages.add("fontenc");
  packages.add("microtype");

  const nodeTypesPresent = new Set<NodeType>(
    Object.values(tree.nodes).map((n: AnyNode) => n.type),
  );

  if (nodeTypesPresent.has("equation_block") || nodeTypesPresent.has("equation_inline")) {
    packages.add("amsmath");
    packages.add("amssymb");
  }
  if (nodeTypesPresent.has("figure")) {
    packages.add("graphicx");
  }
  if (nodeTypesPresent.has("table")) {
    packages.add("booktabs");
  }
  if (nodeTypesPresent.has("algorithm")) {
    packages.add("algorithm2e");
  }
  if (nodeTypesPresent.has("code_block")) {
    packages.add("listings");
  }
  if (
    nodeTypesPresent.has("theorem") ||
    nodeTypesPresent.has("lemma") ||
    nodeTypesPresent.has("definition") ||
    nodeTypesPresent.has("corollary")
  ) {
    packages.add("amsthm");
  }
  if (nodeTypesPresent.has("cite")) {
    packages.add("natbib");
  }
  if (nodeTypesPresent.has("ref")) {
    packages.add("hyperref");
  }

  return Array.from(packages);
}
