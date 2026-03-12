import katex from "katex";

export interface KatexRenderOptions {
  displayMode?: boolean;
  throwOnError?: boolean;
}

/**
 * Renders LaTeX to an HTML string using KaTeX.
 * Never throws — invalid LaTeX returns a red error box HTML string instead.
 */
export function renderLatex(latex: string, options: KatexRenderOptions = {}): string {
  try {
    return katex.renderToString(latex, {
      displayMode: options.displayMode ?? false,
      throwOnError: true,
      strict: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `<span class="katex-error" style="color:#c0392b;font-family:monospace;font-size:0.9em;" title="${escapeAttr(message)}">LaTeX error: ${escapeHtml(message)}</span>`;
  }
}

/**
 * Injects rendered KaTeX HTML directly into a DOM element.
 * Preferred over renderLatex() when you have a DOM node ready — avoids
 * double-parsing by letting KaTeX write to the element directly.
 */
export function renderLatexInto(
  element: HTMLElement,
  latex: string,
  displayMode = false,
): void {
  try {
    katex.render(latex, element, {
      displayMode,
      throwOnError: true,
      strict: false,
    });
    element.classList.remove("katex-error-container");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    element.classList.add("katex-error-container");
    element.style.color = "#c0392b";
    element.style.fontFamily = "monospace";
    element.style.fontSize = "0.9em";
    element.textContent = `LaTeX error: ${message}`;
    element.title = message;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, "&quot;");
}
