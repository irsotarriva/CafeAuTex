import React from "react";
import {
  FilePlus,
  FolderOpen,
  Save,
  FileDown,
  Play,
  PanelLeft,
  PanelRight,
  Undo2,
  Redo2,
} from "lucide-react";

interface ToolbarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onExportPdf: () => void;
  onCompile: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleSidebar: () => void;
  onTogglePreview: () => void;
  isCompiling: boolean;
  sidebarOpen: boolean;
  previewOpen: boolean;
}

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}

function ToolButton({ icon, label, onClick, disabled, active }: ToolButtonProps) {
  return (
    <button
      title={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        border: "none",
        borderRadius: 4,
        background: active ? "#3d3530" : "transparent",
        color: disabled ? "#5c5048" : "#c8bfb8",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = "#3d3530";
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      {icon}
    </button>
  );
}

export function Toolbar({
  onNew,
  onOpen,
  onSave,
  onExportPdf,
  onCompile,
  onUndo,
  onRedo,
  onToggleSidebar,
  onTogglePreview,
  isCompiling,
  sidebarOpen,
  previewOpen,
}: ToolbarProps) {
  return (
    <div
      style={{
        height: 44,
        background: "#2c2520",
        borderBottom: "1px solid #3d3530",
        display: "flex",
        alignItems: "center",
        paddingInline: 8,
        gap: 2,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <span
        style={{
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          fontSize: 15,
          color: "#c4892b",
          marginRight: 8,
          paddingRight: 8,
          borderRight: "1px solid #3d3530",
        }}
      >
        Café AuTex
      </span>

      {/* File group */}
      <ToolButton icon={<FilePlus size={16} />} label="New (⌘N)" onClick={onNew} />
      <ToolButton icon={<FolderOpen size={16} />} label="Open (⌘O)" onClick={onOpen} />
      <ToolButton icon={<Save size={16} />} label="Save (⌘S)" onClick={onSave} />
      <ToolButton icon={<FileDown size={16} />} label="Export PDF" onClick={onExportPdf} />

      <div style={{ width: 1, height: 20, background: "#3d3530", margin: "0 4px" }} />

      {/* Edit group */}
      <ToolButton icon={<Undo2 size={16} />} label="Undo (⌘Z)" onClick={onUndo} />
      <ToolButton icon={<Redo2 size={16} />} label="Redo (⌘⇧Z)" onClick={onRedo} />

      <div style={{ width: 1, height: 20, background: "#3d3530", margin: "0 4px" }} />

      {/* Compile */}
      <ToolButton
        icon={<Play size={16} />}
        label="Compile (⌘↵)"
        onClick={onCompile}
        disabled={isCompiling}
      />

      <div style={{ flex: 1 }} />

      {/* View toggles */}
      <ToolButton
        icon={<PanelLeft size={16} />}
        label="Toggle Sidebar"
        onClick={onToggleSidebar}
        active={sidebarOpen}
      />
      <ToolButton
        icon={<PanelRight size={16} />}
        label="Toggle Preview"
        onClick={onTogglePreview}
        active={previewOpen}
      />
    </div>
  );
}
