import { useEffect, useRef, useState } from "react";
import { saveDocument } from "./documentRepository";
import type { DocumentTree } from "@/model/nodes";

const AUTOSAVE_DEBOUNCE_MS = 500;

export type AutosaveStatus = "saved" | "saving" | "unsaved" | "error";

/**
 * Debounced autosave hook.
 * Returns a label string suitable for the status bar.
 */
export function useAutosave(tree: DocumentTree | null): { label: string; status: AutosaveStatus } {
  const [status, setStatus] = useState<AutosaveStatus>("saved");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const treeRef = useRef(tree);

  useEffect(() => {
    treeRef.current = tree;
    if (!tree) return;

    setStatus("unsaved");

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (!treeRef.current) return;
      setStatus("saving");
      try {
        await saveDocument(treeRef.current);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [tree]);

  const label: Record<AutosaveStatus, string> = {
    saved: "Saved",
    saving: "Saving…",
    unsaved: "Unsaved",
    error: "Save failed",
  };

  return { label: label[status], status };
}
