import { Node as PmNode } from "prosemirror-model";
import { EditorView, NodeView } from "prosemirror-view";
import { renderLatexInto } from "@/utils/katex";

/**
 * ProseMirror NodeView for block equations.
 * Shows a centred KaTeX rendering. Click opens a textarea editor; blur commits.
 */
export class EquationBlockView implements NodeView {
  dom: HTMLElement;
  private node: PmNode;
  private view: EditorView;
  private getPos: () => number | undefined;
  private isEditing = false;
  private textarea: HTMLTextAreaElement | null = null;
  private renderTarget: HTMLDivElement;

  constructor(node: PmNode, view: EditorView, getPos: () => number | undefined) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;

    this.dom = document.createElement("div");
    this.dom.classList.add("equation-block-view");
    this.dom.style.cssText =
      "text-align:center;margin:1.5em 0;padding:12px;cursor:pointer;border-radius:4px;border:1px solid transparent;transition:border-color 0.15s;";

    this.renderTarget = document.createElement("div");
    this.dom.appendChild(this.renderTarget);

    this.render();

    this.dom.addEventListener("click", () => this.startEditing());
    this.dom.addEventListener("mouseenter", () => {
      if (!this.isEditing) this.dom.style.borderColor = "#c4892b55";
    });
    this.dom.addEventListener("mouseleave", () => {
      if (!this.isEditing) this.dom.style.borderColor = "transparent";
    });
  }

  private render(): void {
    if (this.isEditing) return;
    const latex = (this.node.attrs["latex"] as string) || "";
    renderLatexInto(this.renderTarget, latex, true);
  }

  private startEditing(): void {
    if (this.isEditing) return;
    this.isEditing = true;

    const latex = (this.node.attrs["latex"] as string) || "";
    this.dom.style.borderColor = "#c4892b";

    this.textarea = document.createElement("textarea");
    this.textarea.value = latex;
    this.textarea.rows = 3;
    this.textarea.style.cssText =
      "width:100%;font-family:monospace;font-size:13px;padding:8px;border:none;outline:none;resize:vertical;background:#fefaf5;color:#2c2520;border-radius:3px;box-sizing:border-box;";

    this.renderTarget.innerHTML = "";
    this.renderTarget.appendChild(this.textarea);
    this.textarea.focus();
    this.textarea.select();

    this.textarea.addEventListener("blur", () => this.commitEdit());
    this.textarea.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        this.commitEdit();
      }
      // Shift+Enter commits; plain Enter inserts newline
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        this.commitEdit();
      }
    });

    // Live preview below textarea
    this.textarea.addEventListener("input", () => {
      // Could add a live preview here in the future
    });
  }

  private commitEdit(): void {
    if (!this.isEditing || !this.textarea) return;
    const newLatex = this.textarea.value;
    this.isEditing = false;
    this.textarea = null;
    this.dom.style.borderColor = "transparent";

    const pos = this.getPos();
    if (pos === undefined) return;

    const { schema } = this.view.state;
    const newNode = schema.node("equation_block", {
      ...this.node.attrs,
      latex: newLatex,
    });

    const tr = this.view.state.tr.replaceWith(pos, pos + this.node.nodeSize, newNode);
    this.view.dispatch(tr);
  }

  update(node: PmNode): boolean {
    if (node.type !== this.node.type) return false;
    this.node = node;
    if (!this.isEditing) {
      this.renderTarget.innerHTML = "";
      this.render();
    }
    return true;
  }

  stopEvent(event: Event): boolean {
    return this.isEditing && (event.target === this.textarea);
  }

  ignoreMutation(): boolean {
    return true;
  }
}
