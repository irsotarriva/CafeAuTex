import { Node as PmNode } from "prosemirror-model";
import { EditorView, NodeView } from "prosemirror-view";

const SUPPORTED_LANGUAGES = [
  "text", "python", "javascript", "typescript", "rust", "c", "cpp",
  "java", "bash", "latex", "json", "yaml", "html", "css", "sql",
];

/**
 * ProseMirror NodeView for code blocks.
 * Uses a <textarea> for editing and applies basic token colouring
 * via a lightweight class-based approach (no external syntax highlighter
 * to keep the bundle small for Phase 1).
 */
export class CodeBlockView implements NodeView {
  dom: HTMLElement;
  contentDOM: HTMLElement;
  private node: PmNode;
  private view: EditorView;
  private getPos: () => number | undefined;
  private header: HTMLElement;
  private langSelect: HTMLSelectElement;

  constructor(node: PmNode, view: EditorView, getPos: () => number | undefined) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;

    // Outer wrapper
    this.dom = document.createElement("div");
    this.dom.style.cssText =
      "border:1px solid #3d3530;border-radius:6px;margin:1em 0;overflow:hidden;background:#1a1612;";

    // Header with language selector
    this.header = document.createElement("div");
    this.header.style.cssText =
      "display:flex;align-items:center;padding:4px 12px;background:#221e1a;border-bottom:1px solid #3d3530;";

    this.langSelect = document.createElement("select");
    this.langSelect.style.cssText =
      "background:transparent;border:none;color:#8c8078;font-size:11px;cursor:pointer;outline:none;";
    for (const lang of SUPPORTED_LANGUAGES) {
      const opt = document.createElement("option");
      opt.value = lang;
      opt.textContent = lang;
      if (lang === (node.attrs["language"] as string)) opt.selected = true;
      this.langSelect.appendChild(opt);
    }
    this.langSelect.addEventListener("change", () => {
      const pos = this.getPos();
      if (pos === undefined) return;
      const tr = this.view.state.tr.setNodeMarkup(pos, undefined, {
        ...this.node.attrs,
        language: this.langSelect.value,
      });
      this.view.dispatch(tr);
    });

    this.header.appendChild(this.langSelect);
    this.dom.appendChild(this.header);

    // Editable code area — ProseMirror manages content here
    this.contentDOM = document.createElement("code");
    this.contentDOM.style.cssText =
      "display:block;padding:12px 16px;font-family:'JetBrains Mono','Fira Code','Cascadia Code',monospace;font-size:13px;line-height:1.6;color:#c8bfb8;white-space:pre;outline:none;min-height:40px;";

    const pre = document.createElement("pre");
    pre.style.cssText = "margin:0;overflow:auto;";
    pre.appendChild(this.contentDOM);
    this.dom.appendChild(pre);
  }

  update(node: PmNode): boolean {
    if (node.type !== this.node.type) return false;
    this.node = node;
    const lang = node.attrs["language"] as string;
    if (this.langSelect.value !== lang) this.langSelect.value = lang;
    return true;
  }

  stopEvent(event: Event): boolean {
    // Let keyboard events through so the user can type in the code block
    return event instanceof MouseEvent && event.target === this.langSelect;
  }
}
