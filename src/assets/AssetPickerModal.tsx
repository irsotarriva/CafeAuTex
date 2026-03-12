import React, { useRef, useState } from "react";
import { useAssetStore, fileToAsset } from "./assetStore";
import type { Asset } from "@/model/nodes";
import { X, Upload, ImageIcon } from "lucide-react";

interface AssetPickerModalProps {
  onSelect: (asset: Asset) => void;
  onClose: () => void;
}

export function AssetPickerModal({ onSelect, onClose }: AssetPickerModalProps) {
  const assets = useAssetStore((s) => s.assets);
  const addAsset = useAssetStore((s) => s.addAsset);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const asset = await fileToAsset(file);
        await addAsset(asset);
        onSelect(asset);
        return; // pick first image
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#221e1a",
          border: "1px solid #3d3530",
          borderRadius: 8,
          width: 560,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid #3d3530",
          }}
        >
          <span style={{ color: "#c8bfb8", fontWeight: 600, fontSize: 14 }}>
            Pick a figure
          </span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#8c8078", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            void handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            margin: 16,
            border: `2px dashed ${isDragging ? "#c4892b" : "#3d3530"}`,
            borderRadius: 6,
            padding: "24px 16px",
            textAlign: "center",
            cursor: "pointer",
            color: isDragging ? "#c4892b" : "#8c8078",
            fontSize: 13,
            transition: "all 0.15s",
            background: isDragging ? "#2c2520" : "transparent",
          }}
        >
          <Upload size={20} style={{ marginBottom: 8, opacity: 0.7 }} />
          <div>{uploading ? "Uploading…" : "Drop an image or click to browse"}</div>
          <div style={{ fontSize: 11, marginTop: 4, opacity: 0.6 }}>PNG, JPG, SVG, PDF</div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => void handleFiles(e.target.files)}
        />

        {/* Existing assets grid */}
        {assets.size > 0 && (
          <>
            <div style={{ padding: "0 16px 8px", color: "#8c8078", fontSize: 11 }}>
              Previously uploaded
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: 8,
                padding: "0 16px 16px",
                overflowY: "auto",
              }}
            >
              {Array.from(assets.values()).map((asset) => (
                <button
                  key={asset.hash}
                  onClick={() => onSelect(asset)}
                  style={{
                    background: "#2c2520",
                    border: "1px solid #3d3530",
                    borderRadius: 4,
                    padding: 6,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    overflow: "hidden",
                  }}
                >
                  {asset.mimeType.startsWith("image/") ? (
                    <img
                      src={asset.dataUrl}
                      alt={asset.filename}
                      style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: 2 }}
                    />
                  ) : (
                    <ImageIcon size={40} style={{ color: "#8c8078" }} />
                  )}
                  <span
                    style={{
                      color: "#c8bfb8",
                      fontSize: 10,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    {asset.filename}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
