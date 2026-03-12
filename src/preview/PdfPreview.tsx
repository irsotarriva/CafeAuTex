import React, { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";

// Point pdfjs to its worker. Using a CDN-hosted worker to avoid bundling issues.
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfPreviewProps {
  pdfBytes: Uint8Array | null;
  isCompiling?: boolean;
}

export function PdfPreview({ pdfBytes, isCompiling }: PdfPreviewProps) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);

  // Load PDF document whenever bytes change
  useEffect(() => {
    if (!pdfBytes) return;

    const load = async () => {
      if (pdfDocRef.current) {
        await pdfDocRef.current.destroy();
      }
      const doc = await pdfjs.getDocument({ data: pdfBytes }).promise;
      pdfDocRef.current = doc;
      setNumPages(doc.numPages);
      setCurrentPage(1);
    };

    void load();

    return () => {
      pdfDocRef.current?.destroy().catch(() => {});
    };
  }, [pdfBytes]);

  // Render current page whenever page number or doc changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const doc = pdfDocRef.current;
    if (!canvas || !doc) return;

    let cancelled = false;

    const render = async () => {
      const page = await doc.getPage(currentPage);
      if (cancelled) return;

      const viewport = page.getViewport({ scale: 1.5 });
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: ctx, viewport }).promise;
    };

    void render();
    return () => {
      cancelled = true;
    };
  }, [currentPage, numPages]);

  if (!pdfBytes && !isCompiling) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#8c8078",
          fontSize: 13,
          flexDirection: "column",
          gap: 8,
        }}
      >
        <span>No PDF yet</span>
        <span style={{ fontSize: 11 }}>Compile to see the preview</span>
      </div>
    );
  }

  if (isCompiling && !pdfBytes) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#c4892b",
          fontSize: 13,
        }}
      >
        Compiling…
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Page navigation */}
      {numPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "6px 12px",
            background: "#221e1a",
            borderBottom: "1px solid #3d3530",
            fontSize: 12,
            color: "#c8bfb8",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            style={{
              background: "none",
              border: "none",
              color: currentPage <= 1 ? "#5c5048" : "#c8bfb8",
              cursor: currentPage <= 1 ? "not-allowed" : "pointer",
              fontSize: 16,
            }}
          >
            ‹
          </button>
          <span>
            {currentPage} / {numPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            disabled={currentPage >= numPages}
            style={{
              background: "none",
              border: "none",
              color: currentPage >= numPages ? "#5c5048" : "#c8bfb8",
              cursor: currentPage >= numPages ? "not-allowed" : "pointer",
              fontSize: 16,
            }}
          >
            ›
          </button>
        </div>
      )}

      {/* Canvas */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          padding: 16,
          background: "#2c2c2c",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            maxWidth: "100%",
            boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
          }}
        />
      </div>
    </div>
  );
}
