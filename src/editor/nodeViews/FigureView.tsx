import { Node as PmNode } from "prosemirror-model";
import { EditorView, NodeView } from "prosemirror-view";
import { createRoot, type Root } from "react-dom/client";
import React from "react";
import { useAssetStore } from "@/assets/assetStore";
import { AssetPickerModal } from "@/assets/AssetPickerModal";
import type { Asset } from "@/model/nodes";
import { ImageIcon } from "lucide-react";

// ─── React component rendered inside the NodeView ─────────────────────────────

interface FigureInnerProps {
  assetHash: string;
  caption: string;
  label: string;
  onPickAsset: () => void;
  onCaptionChange: (v: string) => void;
  onLabelChange: (v: string) => void;
  showPicker: boolean;
  onPickerClose: () => void;
  onPickerSelect: (asset: Asset) => void;
}

function FigureInner({
  assetHash,
  caption,
  label,
  onPickAsset,
  onCaptionChange,
  onLabelChange,
  showPicker,
  onPickerClose,
  onPickerSelect,
}: FigureInnerProps) {
  const asset = useAssetStore((s) => s.assets.get(assetHash));

  return (
    <>
      <figure
        style={{
          border: "1px solid #3d3530",
          borderRadius: 6,
          padding: 16,
          margin: "1em 0",
          background: "#221e1a",
          textAlign: "center",
        }}
      >
        {asset ? (
          <img
            src={asset.dataUrl}
            alt={caption}
            style={{
              maxWidth: "100%",
              maxHeight: 320,
              objectFit: "contain",
              cursor: "pointer",
            }}
            onClick={onPickAsset}
          />
        ) : (
          <div
            onClick={onPickAsset}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 120,
              cursor: "pointer",
              color: "#8c8078",
              gap: 8,
              border: "2px dashed #3d3530",
              borderRadius: 4,
            }}
          >
            <ImageIcon size={32} />
            <span style={{ fontSize: 12 }}>Click to pick a figure</span>
          </div>
        )}

        {/* Caption */}
        <figcaption style={{ marginTop: 8 }}>
          <input
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            placeholder="Caption…"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid #3d3530",
              color: "#c8bfb8",
              fontSize: 13,
              textAlign: "center",
              outline: "none",
              padding: "4px 0",
            }}
          />
        </figcaption>

        {/* Label */}
        <div style={{ marginTop: 6, fontSize: 11, color: "#8c8078" }}>
          <span>\\label&#123;</span>
          <input
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
            placeholder="fig:label"
            style={{
              background: "transparent",
              border: "none",
              borderBottom: "1px solid #3d3530",
              color: "#8c8078",
              fontSize: 11,
              outline: "none",
              width: 120,
              fontFamily: "monospace",
            }}
          />
          <span>&#125;</span>
        </div>
      </figure>

      {showPicker && (
        <AssetPickerModal onSelect={onPickerSelect} onClose={onPickerClose} />
      )}
    </>
  );
}

// ─── ProseMirror NodeView ─────────────────────────────────────────────────────

export class FigureView implements NodeView {
  dom: HTMLElement;
  private node: PmNode;
  private view: EditorView;
  private getPos: () => number | undefined;
  private root: Root;
  private showPicker = false;

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
    const { assetHash, caption, label } = this.node.attrs as {
      assetHash: string;
      caption: string;
      label: string;
    };

    this.root.render(
      React.createElement(FigureInner, {
        assetHash,
        caption,
        label,
        showPicker: this.showPicker,
        onPickAsset: () => {
          this.showPicker = true;
          this.renderReact();
        },
        onPickerClose: () => {
          this.showPicker = false;
          this.renderReact();
        },
        onPickerSelect: (asset: Asset) => {
          this.showPicker = false;
          this.updateAttrs({ assetHash: asset.hash });
        },
        onCaptionChange: (v: string) => this.updateAttrs({ caption: v }),
        onLabelChange: (v: string) => this.updateAttrs({ label: v }),
      }),
    );
  }

  private updateAttrs(patch: Record<string, string>): void {
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
