import { InputRule } from "prosemirror-inputrules";
import { latexSchema } from "../schema";

/**
 * `$...$`  → equation_inline node
 * `\[...\]` on its own line → equation_block node
 */

// Matches $latex$ typed inline (single-line only)
const inlineMathRule = new InputRule(
  /\$([^$\n]+)\$$/,
  (state, match, start, end) => {
    const latex = match[1];
    if (!latex) return null;
    const nodeId = crypto.randomUUID();
    const node = latexSchema.node("equation_inline", { latex, nodeId });
    return state.tr.replaceWith(start, end, node);
  },
);

// Matches \[latex\] at start of a paragraph
const blockMathRule = new InputRule(
  /\\\[([^\]]*)\\\]$/,
  (state, match, start, end) => {
    const latex = match[1] ?? "";
    const nodeId = crypto.randomUUID();
    const node = latexSchema.node("equation_block", { latex, numbered: false, nodeId });
    return state.tr.replaceWith(start, end, node);
  },
);

export const mathInputRules = [inlineMathRule, blockMathRule];
