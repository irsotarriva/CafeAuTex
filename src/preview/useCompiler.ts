import { useState, useEffect, useRef, useCallback } from "react";
import { compileLaTeX } from "@/tauri/commands";
import type { CompileStatus } from "@/shell/StatusBar";

const DEBOUNCE_MS = 1500;

interface CompilerState {
  pdfBytes: Uint8Array | null;
  error: string | null;
  isCompiling: boolean;
  compileStatus: CompileStatus;
  /** Call to trigger a manual compile */
  triggerCompile: (texContent: string, outputDir: string) => void;
}

/**
 * Debounced compile-on-change hook.
 * `latexContent` changes trigger a compile after DEBOUNCE_MS of quiet time.
 */
export function useCompiler(
  latexContent: string | null,
  outputDir: string,
): CompilerState {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileStatus, setCompileStatus] = useState<CompileStatus>("idle");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestContent = useRef(latexContent);

  const runCompile = useCallback(async (tex: string, outDir: string) => {
    setIsCompiling(true);
    setCompileStatus("compiling");
    setError(null);

    try {
      const result = await compileLaTeX(tex, outDir);
      if (result.success && result.pdf_path) {
        // In a real implementation we'd read the PDF bytes from disk via Tauri.
        // For now we signal success; the PDF bytes will be loaded by the preview.
        setCompileStatus("success");
        setError(null);
      } else {
        setCompileStatus("error");
        setError(result.log || "Compilation failed");
        setPdfBytes(null);
      }
    } catch (err) {
      setCompileStatus("error");
      setError(err instanceof Error ? err.message : String(err));
      setPdfBytes(null);
    } finally {
      setIsCompiling(false);
    }
  }, []);

  // Debounced auto-compile on content change
  useEffect(() => {
    latestContent.current = latexContent;
    if (!latexContent) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (latestContent.current) {
        void runCompile(latestContent.current, outputDir);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [latexContent, outputDir, runCompile]);

  const triggerCompile = useCallback(
    (texContent: string, outDir: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      void runCompile(texContent, outDir);
    },
    [runCompile],
  );

  return { pdfBytes, error, isCompiling, compileStatus, triggerCompile };
}
