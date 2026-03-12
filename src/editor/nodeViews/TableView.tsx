import { Node as PmNode } from "prosemirror-model";
import { EditorView, NodeView } from "prosemirror-view";
import { createRoot, type Root } from "react-dom/client";
import React, { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

// ─── React table editor ───────────────────────────────────────────────────────

interface TableEditorProps {
  headers: string[];
  data: string[][];
  caption: string;
  label: string;
  onChange: (patch: { headers?: string[]; data?: string[][]; caption?: string; label?: string }) => void;
}

function TableEditor({ headers, data, caption, label, onChange }: TableEditorProps) {
  const [localHeaders, setLocalHeaders] = useState(headers);
  const [localData, setLocalData] = useState(data);

  const updateHeader = (col: number, val: string) => {
    const next = localHeaders.map((h, i) => (i === col ? val : h));
    setLocalHeaders(next);
    onChange({ headers: next });
  };

  const updateCell = (row: number, col: number, val: string) => {
    const next = localData.map((r, ri) =>
      ri === row ? r.map((c, ci) => (ci === col ? val : c)) : r,
    );
    setLocalData(next);
    onChange({ data: next });
  };

  const addRow = () => {
    const next = [...localData, Array(localHeaders.length).fill("")];
    setLocalData(next);
    onChange({ data: next });
  };

  const removeRow = (row: number) => {
    const next = localData.filter((_, i) => i !== row);
    setLocalData(next);
    onChange({ data: next });
  };

  const addCol = () => {
    const nextHeaders = [...localHeaders, ""];
    const nextData = localData.map((r) => [...r, ""]);
    setLocalHeaders(nextHeaders);
    setLocalData(nextData);
    onChange({ headers: nextHeaders, data: nextData });
  };

  const removeCol = (col: number) => {
    const nextHeaders = localHeaders.filter((_, i) => i !== col);
    const nextData = localData.map((r) => r.filter((_, i) => i !== col));
    setLocalHeaders(nextHeaders);
    setLocalData(nextData);
    onChange({ headers: nextHeaders, data: nextData });
  };

  const cellStyle: React.CSSProperties = {
    border: "1px solid #3d3530",
    padding: "4px 8px",
    minWidth: 80,
  };
  const inputStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    outline: "none",
    width: "100%",
    color: "#c8bfb8",
    fontSize: 13,
    fontFamily: "inherit",
  };

  return (
    <div
      style={{
        border: "1px solid #3d3530",
        borderRadius: 6,
        margin: "1em 0",
        background: "#221e1a",
        overflow: "auto",
      }}
    >
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          fontSize: 13,
          color: "#c8bfb8",
        }}
      >
        <thead>
          <tr style={{ background: "#2c2520" }}>
            {localHeaders.map((h, col) => (
              <th key={col} style={{ ...cellStyle, fontWeight: 600 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    value={h}
                    onChange={(e) => updateHeader(col, e.target.value)}
                    placeholder={`Col ${col + 1}`}
                    style={inputStyle}
                  />
                  <button
                    onClick={() => removeCol(col)}
                    style={{ background: "none", border: "none", color: "#5c5048", cursor: "pointer", padding: 0 }}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </th>
            ))}
            <th style={{ ...cellStyle, width: 32, textAlign: "center" }}>
              <button
                onClick={addCol}
                style={{ background: "none", border: "none", color: "#c4892b", cursor: "pointer", padding: 0 }}
                title="Add column"
              >
                <PlusCircle size={14} />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {localData.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={cellStyle}>
                  <input
                    value={cell}
                    onChange={(e) => updateCell(ri, ci, e.target.value)}
                    style={inputStyle}
                  />
                </td>
              ))}
              <td style={{ ...cellStyle, textAlign: "center" }}>
                <button
                  onClick={() => removeRow(ri)}
                  style={{ background: "none", border: "none", color: "#5c5048", cursor: "pointer", padding: 0 }}
                >
                  <Trash2 size={11} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add row */}
      <div style={{ padding: "6px 12px" }}>
        <button
          onClick={addRow}
          style={{
            background: "none",
            border: "none",
            color: "#c4892b",
            cursor: "pointer",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <PlusCircle size={13} /> Add row
        </button>
      </div>

      {/* Caption & label */}
      <div
        style={{
          borderTop: "1px solid #3d3530",
          padding: "8px 12px",
          display: "flex",
          gap: 16,
          fontSize: 12,
        }}
      >
        <input
          value={caption}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="Caption…"
          style={{ ...inputStyle, flex: 1, color: "#8c8078" }}
        />
        <span style={{ color: "#5c5048", fontFamily: "monospace" }}>\\label&#123;</span>
        <input
          value={label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="tab:label"
          style={{ ...inputStyle, width: 100, color: "#8c8078", fontFamily: "monospace" }}
        />
        <span style={{ color: "#5c5048", fontFamily: "monospace" }}>&#125;</span>
      </div>
    </div>
  );
}

// ─── ProseMirror NodeView ─────────────────────────────────────────────────────

export class TableView implements NodeView {
  dom: HTMLElement;
  private node: PmNode;
  private view: EditorView;
  private getPos: () => number | undefined;
  private root: Root;

  constructor(node: PmNode, view: EditorView, getPos: () => number | undefined) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;

    this.dom = document.createElement("div");
    this.dom.contentEditable = "false";
    this.root = createRoot(this.dom);
    this.renderReact();
  }

  private renderReact(): void {
    const { headers, data, caption, label } = this.node.attrs as {
      headers: string[];
      data: string[][];
      caption: string;
      label: string;
    };

    this.root.render(
      React.createElement(TableEditor, {
        headers,
        data,
        caption,
        label,
        onChange: (patch) => this.updateAttrs(patch),
      }),
    );
  }

  private updateAttrs(patch: Record<string, unknown>): void {
    const pos = this.getPos();
    if (pos === undefined) return;
    const tr = this.view.state.tr.setNodeMarkup(pos, undefined, {
      ...this.node.attrs,
      ...patch,
    });
    this.view.dispatch(tr);
  }

  update(node: PmNode): boolean {
    if (node.type !== this.node.type) return false;
    this.node = node;
    this.renderReact();
    return true;
  }

  stopEvent(): boolean {
    return true;
  }

  ignoreMutation(): boolean {
    return true;
  }

  destroy(): void {
    this.root.unmount();
  }
}
