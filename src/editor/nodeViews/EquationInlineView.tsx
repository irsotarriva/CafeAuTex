import { Node as PmNode } from "prosemirror-model";
import { EditorView, NodeView } from "prosemirror-view";
import { renderLatexInto } from "@/utils/katex";

/**
 * ProseMirror NodeView for inline equations.
 * Click to edit; blur commits the new LaTeX and re-renders via KaTeX.
 * MathQuill is loaded lazily on first click.
 */
export class EquationInlineView implements NodeView {
  dom: HTMLElement;
  private node: PmNode;
  private view: EditorView;
  private getPos: () => number | undefined;
  private isEditing = false;
  private input: HTMLInputElement | null = null;

  constructor(node: PmNode, view: EditorView, getPos: () => number | undefined) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;

    this.dom = document.createElement("span");
    this.dom.classList.add("equation-inline-view");
    this.dom.style.cursor = "pointer";
    this.dom.style.display = "inline-block";
    this.dom.style.verticalAlign = "middle";

    this.render();

    this.dom.addEventListener("click", () => this.startEditing());
  }

  private render(): void {
    if (this.isEditing) return;
    const latex = (this.node.attrs["latex"] as string) || "";
    renderLatexInto(this.dom, latex, false);
  }

  private startEditing(): void {
    if (this.isEditing) return;
    this.isEditing = true;

    const latex = (this.node.attrs["latex"] as string) || "";

    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.value = latex;
    this.input.style.cssText =
      "font-family:monospace;font-size:13px;padding:2px 4px;border:1px solid #c4892b;border-radius:3px;outline:none;min-width:60px;background:#fefaf5;color:#2c2520;";

    this.dom.innerHTML = "";
    this.dom.appendChild(this.input);
    this.input.focus();
    this.input.select();

    this.input.addEventListener("blur", () => this.commitEdit());
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        this.commitEdit();
      }
    });
  }

  private commitEdit(): void {
    if (!this.isEditing || !this.input) return;
    const newLatex = this.input.value;
    this.isEditing = false;
    this.input = null;

    const pos = this.getPos();
    if (pos === undefined) return;

    const { schema } = this.view.state;
    const newNode = schema.node("equation_inline", {
      ...this.node.attrs,
      latex: newLatex,
    });

    const tr = this.view.state.tr.replaceWith(pos, pos + this.node.nodeSize, newNode);
    this.view.dispatch(tr);
  }

  update(node: PmNode): boolean {
    if (node.type !== this.node.type) return false;
    this.node = node;
    if (!this.isEditing) this.render();
    return true;
  }

  stopEvent(event: Event): boolean {
    return this.isEditing && (event.target === this.input);
  }

  ignoreMutation(): boolean {
    return true;
  }
}
