import React from "react";

export type CompileStatus = "idle" | "compiling" | "success" | "error";

interface StatusBarProps {
  compileStatus: CompileStatus;
  wordCount: number;
  cursorLine: number;
  cursorCol: number;
  autosaveLabel: string;
}

export function StatusBar({
  compileStatus,
  wordCount,
  cursorLine,
  cursorCol,
  autosaveLabel,
}: StatusBarProps) {
  const statusIndicator: Record<CompileStatus, { label: string; color: string }> = {
    idle: { label: "Ready", color: "#8c8078" },
    compiling: { label: "Compiling…", color: "#c4892b" },
    success: { label: "Compiled", color: "#4a7c59" },
    error: { label: "Compile error", color: "#b94040" },
  };

  const { label, color } = statusIndicator[compileStatus];

  return (
    <div
      style={{
        height: 24,
        background: "#2c2520",
        color: "#c8bfb8",
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        paddingInline: 12,
        gap: 16,
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      <span style={{ color, fontWeight: 500 }}>{label}</span>
      <span style={{ color: "#8c8078" }}>|</span>
      <span>Ln {cursorLine}, Col {cursorCol}</span>
      <span style={{ color: "#8c8078" }}>|</span>
      <span>{wordCount} words</span>
      <span style={{ marginLeft: "auto", color: "#8c8078" }}>{autosaveLabel}</span>
    </div>
  );
}
