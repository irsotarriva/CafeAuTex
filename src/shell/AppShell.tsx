import React, { useState, useCallback } from "react";
import { Toolbar } from "./Toolbar";
import { StatusBar, type CompileStatus } from "./StatusBar";

interface AppShellProps {
  /** Main editor area */
  editorSlot?: React.ReactNode;
  /** Left sidebar (outline, bibliography, assets) */
  sidebarSlot?: React.ReactNode;
  /** Right PDF preview pane */
  previewSlot?: React.ReactNode;
  /** Compile error panel (shown below editor when there are errors) */
  errorPanelSlot?: React.ReactNode;

  // Toolbar callbacks — wired up by the parent
  onNew?: () => void;
  onOpen?: () => void;
  onSave?: () => void;
  onExportPdf?: () => void;
  onCompile?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;

  // Status bar state
  compileStatus?: CompileStatus;
  wordCount?: number;
  cursorLine?: number;
  cursorCol?: number;
  autosaveLabel?: string;
  isCompiling?: boolean;
}

export function AppShell({
  editorSlot,
  sidebarSlot,
  previewSlot,
  errorPanelSlot,
  onNew = () => {},
  onOpen = () => {},
  onSave = () => {},
  onExportPdf = () => {},
  onCompile = () => {},
  onUndo = () => {},
  onRedo = () => {},
  compileStatus = "idle",
  wordCount = 0,
  cursorLine = 1,
  cursorCol = 1,
  autosaveLabel = "Saved",
  isCompiling = false,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const togglePreview = useCallback(() => setPreviewOpen((v) => !v), []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        background: "#1a1612",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Top toolbar */}
      <Toolbar
        onNew={onNew}
        onOpen={onOpen}
        onSave={onSave}
        onExportPdf={onExportPdf}
        onCompile={onCompile}
        onUndo={onUndo}
        onRedo={onRedo}
        onToggleSidebar={toggleSidebar}
        onTogglePreview={togglePreview}
        isCompiling={isCompiling}
        sidebarOpen={sidebarOpen}
        previewOpen={previewOpen}
      />

      {/* Main content area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <div
            style={{
              width: 240,
              flexShrink: 0,
              background: "#221e1a",
              borderRight: "1px solid #3d3530",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {sidebarSlot ?? (
              <div
                style={{
                  padding: 16,
                  color: "#8c8078",
                  fontSize: 13,
                  textAlign: "center",
                  marginTop: 40,
                }}
              >
                Document outline will appear here
              </div>
            )}
          </div>
        )}

        {/* Editor pane */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <div style={{ flex: 1, overflow: "auto" }}>
            {editorSlot ?? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#8c8078",
                  fontSize: 14,
                }}
              >
                Open or create a document to begin editing
              </div>
            )}
          </div>
          {/* Compile error panel */}
          {errorPanelSlot && (
            <div
              style={{
                borderTop: "1px solid #3d3530",
                maxHeight: 180,
                overflow: "auto",
              }}
            >
              {errorPanelSlot}
            </div>
          )}
        </div>

        {/* PDF preview pane */}
        {previewOpen && (
          <div
            style={{
              width: "40%",
              minWidth: 320,
              flexShrink: 0,
              background: "#1a1612",
              borderLeft: "1px solid #3d3530",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {previewSlot ?? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#8c8078",
                  fontSize: 13,
                }}
              >
                PDF preview will appear here after compilation
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <StatusBar
        compileStatus={compileStatus}
        wordCount={wordCount}
        cursorLine={cursorLine}
        cursorCol={cursorCol}
        autosaveLabel={autosaveLabel}
      />
    </div>
  );
}
