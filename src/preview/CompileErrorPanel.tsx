import React from "react";

interface ErrorLine {
  lineNumber: number | null;
  message: string;
  type: "error" | "warning" | "info";
}

/**
 * Parses Tectonic/LaTeX stderr and displays errors with line references.
 */
function parseErrors(log: string): ErrorLine[] {
  const lines = log.split("\n");
  const result: ErrorLine[] = [];

  for (const line of lines) {
    // LaTeX errors: "! Something went wrong."
    const errorMatch = /^!\s+(.+)/.exec(line);
    if (errorMatch) {
      result.push({ lineNumber: null, message: errorMatch[1] ?? line, type: "error" });
      continue;
    }

    // Line reference: "l.42 some content"
    const lineRefMatch = /^l\.(\d+)\s+(.*)/.exec(line);
    if (lineRefMatch) {
      const last = result[result.length - 1];
      if (last) {
        last.lineNumber = parseInt(lineRefMatch[1] ?? "0", 10);
      }
      continue;
    }

    // Warnings
    const warnMatch = /^(LaTeX Warning|Package \w+ Warning):\s*(.+)/.exec(line);
    if (warnMatch) {
      result.push({ lineNumber: null, message: warnMatch[2] ?? line, type: "warning" });
      continue;
    }
  }

  // Deduplicate consecutive identical messages
  return result.filter(
    (item, i, arr) => i === 0 || item.message !== arr[i - 1]?.message,
  );
}

interface CompileErrorPanelProps {
  log: string;
}

export function CompileErrorPanel({ log }: CompileErrorPanelProps) {
  const errors = parseErrors(log);

  if (errors.length === 0) {
    return (
      <div style={{ padding: "8px 12px", color: "#8c8078", fontSize: 12 }}>
        {log || "No output"}
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#1e1a17",
        color: "#c8bfb8",
        fontSize: 12,
        fontFamily: "monospace",
        overflowY: "auto",
        maxHeight: 180,
      }}
    >
      {errors.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            padding: "4px 12px",
            borderBottom: "1px solid #2c2520",
            color:
              item.type === "error"
                ? "#e07070"
                : item.type === "warning"
                  ? "#c4892b"
                  : "#8c8078",
          }}
        >
          <span style={{ fontWeight: 600, minWidth: 48 }}>
            {item.type === "error" ? "Error" : item.type === "warning" ? "Warn" : "Info"}
          </span>
          {item.lineNumber !== null && (
            <span style={{ color: "#8c8078", minWidth: 40 }}>
              l.{item.lineNumber}
            </span>
          )}
          <span style={{ flex: 1, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {item.message}
          </span>
        </div>
      ))}
    </div>
  );
}
