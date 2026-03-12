import type { DocumentTree, NodeID } from "./nodes";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateTree(tree: DocumentTree): ValidationResult {
  const errors: string[] = [];
  const nodeIds = new Set(Object.keys(tree.nodes));

  // Root must exist
  if (!nodeIds.has(tree.rootId)) {
    errors.push(`Root node "${tree.rootId}" not found in nodes map`);
  }

  // Root must be type 'document'
  const root = tree.nodes[tree.rootId];
  if (root && root.type !== "document") {
    errors.push(`Root node must be type "document", got "${root.type}"`);
  }

  // Walk every node and validate children references
  for (const [id, node] of Object.entries(tree.nodes)) {
    if (node.id !== id) {
      errors.push(`Node id mismatch: key "${id}" but node.id is "${node.id}"`);
    }
    if (!node.type) {
      errors.push(`Node "${id}" is missing a type`);
    }
    if (node.children) {
      for (const childId of node.children) {
        if (!nodeIds.has(childId)) {
          errors.push(
            `Node "${id}" references child "${childId}" which does not exist`,
          );
        }
      }
    }
  }

  // Check for unreachable nodes (orphans) via BFS from root
  const reachable = new Set<NodeID>();
  const queue: NodeID[] = [tree.rootId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (reachable.has(current)) continue;
    reachable.add(current);
    const node = tree.nodes[current];
    if (node?.children) {
      for (const child of node.children) {
        if (!reachable.has(child)) {
          queue.push(child);
        }
      }
    }
  }

  for (const id of nodeIds) {
    if (!reachable.has(id)) {
      errors.push(`Node "${id}" is unreachable (orphan) from root`);
    }
  }

  return { valid: errors.length === 0, errors };
}
