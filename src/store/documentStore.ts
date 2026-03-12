import { create } from "zustand";
import type { AnyNode, DocumentTree, NodeID } from "@/model/nodes";
import { createNode } from "@/model/nodeRegistry";

// ─── Actions ──────────────────────────────────────────────────────────────────

export type DocumentAction =
  | { type: "SET_TREE"; tree: DocumentTree }
  | { type: "UPDATE_NODE"; id: NodeID; patch: Partial<AnyNode> }
  | { type: "ADD_NODE"; node: AnyNode; parentId: NodeID; index?: number }
  | { type: "REMOVE_NODE"; id: NodeID }
  | { type: "MOVE_NODE"; id: NodeID; newParentId: NodeID; index: number };

// ─── Store state ──────────────────────────────────────────────────────────────

interface DocumentState {
  tree: DocumentTree | null;
  // Dispatch an action and update the tree
  dispatch: (action: DocumentAction) => void;
  // Convenience: load a tree wholesale
  loadTree: (tree: DocumentTree) => void;
  // Create a fresh empty document
  newDocument: () => void;
}

function createEmptyTree(): DocumentTree {
  const rootId = crypto.randomUUID();
  const root = createNode("document", rootId);
  return {
    version: 1,
    nodes: { [rootId]: root },
    rootId,
    assets: { assets: {} },
    bib: { entries: {} },
  };
}

function applyAction(tree: DocumentTree, action: DocumentAction): DocumentTree {
  switch (action.type) {
    case "SET_TREE":
      return action.tree;

    case "UPDATE_NODE": {
      const existing = tree.nodes[action.id];
      if (!existing) return tree;
      return {
        ...tree,
        nodes: {
          ...tree.nodes,
          [action.id]: { ...existing, ...action.patch } as AnyNode,
        },
      };
    }

    case "ADD_NODE": {
      const parent = tree.nodes[action.parentId];
      if (!parent) return tree;
      const children = [...(parent.children ?? [])];
      const index = action.index ?? children.length;
      children.splice(index, 0, action.node.id);
      return {
        ...tree,
        nodes: {
          ...tree.nodes,
          [action.node.id]: action.node,
          [action.parentId]: { ...parent, children } as AnyNode,
        },
      };
    }

    case "REMOVE_NODE": {
      // Remove from parent's children and delete from nodes map
      const newNodes = { ...tree.nodes };
      delete newNodes[action.id];
      // Strip from any parent that references it
      for (const [id, node] of Object.entries(newNodes)) {
        if (node.children?.includes(action.id)) {
          newNodes[id] = {
            ...node,
            children: node.children.filter((c) => c !== action.id),
          } as AnyNode;
        }
      }
      return { ...tree, nodes: newNodes };
    }

    case "MOVE_NODE": {
      const node = tree.nodes[action.id];
      if (!node) return tree;
      const newParent = tree.nodes[action.newParentId];
      if (!newParent) return tree;

      // Remove from old parent
      let newNodes = { ...tree.nodes };
      for (const [id, n] of Object.entries(newNodes)) {
        if (n.children?.includes(action.id)) {
          newNodes[id] = {
            ...n,
            children: n.children.filter((c) => c !== action.id),
          } as AnyNode;
        }
      }

      // Add to new parent at index
      const newChildren = [...(newNodes[action.newParentId]?.children ?? [])];
      newChildren.splice(action.index, 0, action.id);
      newNodes = {
        ...newNodes,
        [action.newParentId]: { ...newParent, children: newChildren } as AnyNode,
      };

      return { ...tree, nodes: newNodes };
    }

    default:
      return tree;
  }
}

// ─── Zustand store ────────────────────────────────────────────────────────────

export const useDocumentStore = create<DocumentState>((set) => ({
  tree: null,

  dispatch(action) {
    set((state) => {
      if (!state.tree) return state;
      return { tree: applyAction(state.tree, action) };
    });
  },

  loadTree(tree) {
    set({ tree });
  },

  newDocument() {
    set({ tree: createEmptyTree() });
  },
}));
