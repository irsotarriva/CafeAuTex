import React, { useEffect, useRef } from "react";
import { EditorView, type NodeViewConstructor } from "prosemirror-view";
import { EditorState } from "prosemirror-state";
import { undo, redo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { buildPlugins } from "./plugins";
import { createEditorState, extractActions } from "./sync";
import { useDocumentStore } from "@/store/documentStore";
import { EquationInlineView } from "./nodeViews/EquationInlineView";
import { EquationBlockView } from "./nodeViews/EquationBlockView";
import { FigureView } from "./nodeViews/FigureView";
import { TableView } from "./nodeViews/TableView";
import { CodeBlockView } from "./nodeViews/CodeBlockView";
import "prosemirror-view/style/prosemirror.css";
import "katex/dist/katex.min.css";

const nodeViews: Record<string, NodeViewConstructor> = {
  equation_inline: (node, view, getPos) =>
    new EquationInlineView(node, view, getPos),
  equation_block: (node, view, getPos) =>
    new EquationBlockView(node, view, getPos),
  figure: (node, view, getPos) => new FigureView(node, view, getPos),
  table: (node, view, getPos) => new TableView(node, view, getPos),
  code_block: (node, view, getPos) => new CodeBlockView(node, view, getPos),
};

interface EditorProps {
  onCursorChange?: (line: number, col: number) => void;
  onWordCountChange?: (count: number) => void;
}

export function Editor({ onCursorChange, onWordCountChange }: EditorProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const tree = useDocumentStore((s) => s.tree);
  const dispatch = useDocumentStore((s) => s.dispatch);

  // Mount the EditorView once
  useEffect(() => {
    if (!mountRef.current) return;

    const state: EditorState = createEditorState(tree);

    const view = new EditorView(mountRef.current, {
      state,
      nodeViews,
      dispatchTransaction(tr) {
        const newState = view.state.apply(tr);
        view.updateState(newState);

        // Sync changes back to Zustand
        if (tr.docChanged) {
          const actions = extractActions(tr);
          for (const action of actions) {
            dispatch(action);
          }

          // Word count
          if (onWordCountChange) {
            const text = newState.doc.textContent;
            const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
            onWordCountChange(words);
          }
        }

        // Cursor position
        if (onCursorChange) {
          const { from } = newState.selection;
          const resolved = newState.doc.resolve(from);
          onCursorChange(resolved.depth + 1, resolved.parentOffset + 1);
        }
      },
    });

    // Add undo/redo keybindings
    // (prosemirror-keymap is already in plugins, but we need history keymaps too)
    const undoPlugin = keymap({
      "Mod-z": undo,
      "Mod-Shift-z": redo,
      "Mod-y": redo,
    });
    const newState = EditorState.create({
      schema: state.schema,
      doc: state.doc,
      plugins: [...buildPlugins(), undoPlugin],
    });
    view.updateState(newState);

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount once

  // Sync external tree changes (e.g. after file open) into ProseMirror
  useEffect(() => {
    const view = viewRef.current;
    if (!view || !tree) return;

    const newState = createEditorState(tree);
    // Preserve plugins from current state
    const withPlugins = EditorState.create({
      schema: view.state.schema,
      doc: newState.doc,
      plugins: view.state.plugins,
    });
    view.updateState(withPlugins);
  }, [tree]);

  return (
    <div
      style={{
        flex: 1,
        padding: "48px 64px",
        maxWidth: 760,
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        ref={mountRef}
        style={{
          outline: "none",
          fontSize: 15,
          lineHeight: 1.7,
          color: "#2c2520",
          fontFamily: "Georgia, 'Times New Roman', serif",
          minHeight: "calc(100vh - 200px)",
        }}
      />
    </div>
  );
}
