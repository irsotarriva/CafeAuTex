# Document Node Schema

This document is the canonical reference for all node types in the Café AuTex document tree.
Every element in a document is a typed node with a stable identity (UUID). The LaTeX export
engine and the MCP server both consume this schema.

For implementation details, see `src/model/`.

---

## Structural Nodes

These nodes define the document hierarchy. They contain other nodes as children.

| Node type | Description | Key fields |
|---|---|---|
| `Document` | Root node. Every document has exactly one. | `id`, `title`, `documentClass`, `pluginManifest`, `submissionDeadline`, `templateRef` |
| `Chapter` | Top-level structural division. Used in book/thesis document classes. | `id`, `title`, `label`, `numbered` |
| `Section` | Standard `\section{}`. | `id`, `title`, `label`, `numbered` |
| `Subsection` | `\subsection{}`. | `id`, `title`, `label`, `numbered` |
| `Subsubsection` | `\subsubsection{}`. | `id`, `title`, `label`, `numbered` |
| `Appendix` | Appendix section. Serialises with `\appendix` marker before first instance. | `id`, `title`, `label` |

---

## Content Nodes

These nodes carry the actual document content. They appear as children of structural nodes.

| Node type | Description | Key fields |
|---|---|---|
| `Paragraph` | A block of prose text. May contain inline nodes. | `id`, `content` (inline nodes) |
| `EquationInline` | Inline math wrapped in `$...$`. | `id`, `source` (LaTeX math string) |
| `EquationDisplay` | Display math: `equation`, `align`, `gather`, etc. | `id`, `source`, `environment`, `label`, `numbered` |
| `Figure` | A figure with caption and label. References a versioned asset. | `id`, `assetId`, `activeVersionId`, `caption`, `label`, `placement`, `width` |
| `TableEditable` | A table with content stored as structured data in the tree. Edited via spreadsheet UI. | `id`, `rows`, `columns`, `cells`, `caption`, `label`, `placement` |
| `TableAsset` | A table whose content is an external file (CSV or LaTeX tabular blob). Versioned like a figure. | `id`, `assetId`, `activeVersionId`, `caption`, `label`, `placement` |
| `List` | An itemize or enumerate list. | `id`, `style` (`itemize` or `enumerate`), `items` (array of inline content) |
| `Algorithm` | An algorithm environment (via algorithm2e plugin). | `id`, `caption`, `label`, `source` |
| `Theorem` | Theorem-like environments (theorem, lemma, proposition, corollary). | `id`, `envType`, `label`, `title` (optional), `content` |
| `Lemma` | Lemma environment. | `id`, `label`, `title`, `content` |
| `Proof` | Proof environment. Closes with QED marker. | `id`, `content` |
| `Definition` | Definition environment. | `id`, `label`, `title`, `content` |
| `Remark` | Remark environment. | `id`, `label`, `title`, `content` |
| `CodeBlock` | Verbatim code listing (via listings or minted plugin). | `id`, `language`, `caption`, `label`, `source` |
| `Verbatim` | Raw verbatim block. No syntax highlighting. | `id`, `source` |

---

## Cross-Reference Nodes

These nodes are inline — they appear within `Paragraph` or other content node text.

| Node type | Description | Key fields |
|---|---|---|
| `Citation` | An inline citation. Renders as a chip showing the cite key. | `id`, `keys` (array of bib entry IDs), `prenote`, `postnote` |
| `CrossRef` | A cross-reference to another node by label. Renders as `\ref{}` or `\cref{}`. | `id`, `targetId`, `style` (`ref`, `cref`, `pageref`) |
| `Footnote` | A footnote. Content is stored inline; export places it at the correct position. | `id`, `content` (inline nodes) |
| `Label` | An explicit label node. Usually auto-generated from the parent node's ID, but can be overridden. | `id`, `key` |
| `Acronym` | An acronym instance. First use expands to full form; subsequent uses use the short form. | `id`, `acronymId` (ref to Acronym table entry) |

---

## Metadata Nodes

Metadata nodes are children of the `Document` root. They populate the document preamble and title block on export.

| Node type | Description | Key fields |
|---|---|---|
| `Title` | Document title. | `id`, `text` |
| `Authors` | Author list. | `id`, `authors` (array of `{ name, affiliation, email, orcid }`) |
| `Abstract` | Document abstract. | `id`, `content` (paragraph content) |
| `Keywords` | Keyword list. | `id`, `keywords` (array of strings) |
| `Affiliations` | Institution affiliations. Referenced by author entries. | `id`, `affiliations` (array of `{ key, name, address }`) |
| `SubmissionDeadline` | Submission deadline date. Drives deadline-aware UI across the editor. | `id`, `date` (ISO 8601) |

---

## Administrative Nodes (managed automatically, not directly user-editable)

These nodes exist in the tree but are managed by the editor. Users interact with them
indirectly through the command palette or settings — not by editing the nodes directly.

| Node type | Description | Key fields |
|---|---|---|
| `Preamble` | Aggregates `\usepackage` declarations inferred from node types in use. Rebuilt on export. | `id`, `packages` (derived) |
| `CommandNamespace` | Registry of all `\newcommand` definitions in the document. Enforces uniqueness. | `id`, `commands` (array of `{ name, definition, arity }`) |
| `AcronymTable` | Registry of all acronym definitions. Tracks first-use expansion state per compile. | `id`, `entries` (array of `{ key, short, long }`) |
| `BibliographyStore` | The document's bibliography database. Contains all cited and imported references. | `id`, `entries` (array of typed bib objects) |
| `AssetRegistry` | Tracks all figure and table assets with their version stacks. | `id`, `assets` (array of asset records) |

---

## Notes

- Every node has a stable `id` (UUIDv4) assigned at creation and never changed.
- Labels in LaTeX export are derived deterministically from node IDs — broken `\ref{}` links are impossible.
- The `Administrative` nodes are serialised into the LaTeX preamble and `.bib` file at export time. They are never directly edited as raw LaTeX.
- New node types are registered via the plugin system. See `src/plugins/` and `docs/ARCHITECTURE.md`.
