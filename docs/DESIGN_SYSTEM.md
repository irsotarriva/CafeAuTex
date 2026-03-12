# Café AuTex — Design System

## 1. Brand and Philosophy

The app is named **Café AuTex** — a play on *café au lait* and LaTeX. The logo is a coffee cup
with latte art in the shape of a leaf.

The design should feel like a well-loved independent coffee shop: warm, unhurried, and
comfortable. Somewhere a novelist or a physicist could sit for three hours and feel at home.
This is a deliberate contrast to Overleaf's sterile, utilitarian interface. We want users to
*want* to open the app.

That said, our users are scientists and academics — not lifestyle bloggers. The warmth is
expressed through color temperature, typography, and spacing, not through decorative clutter.
The result should be: **professional, but welcoming. Clean, but not cold.**

Every design decision asks: *does this make the writing experience better, or does it get in
the way?* The editor canvas is the product. The UI chrome exists to serve it.

---

## 2. Color Palette

All colors are defined as CSS custom properties. Both light and dark themes are first-class.

### Light Theme

```css
:root {
  /* Backgrounds — warm off-whites, never pure white */
  --color-bg-canvas:    #faf8f5;   /* main editor canvas — warm parchment */
  --color-bg-surface:   #f2ede6;   /* sidebar, panels */
  --color-bg-overlay:   #eee8de;   /* modals, dropdowns */
  --color-bg-hover:     #e8e1d6;   /* hover state on list items */
  --color-bg-active:    #dfd8cc;   /* selected/active state */

  /* Text */
  --color-text-primary:   #2c2520;  /* warm near-black */
  --color-text-secondary: #5c5048;  /* secondary labels */
  --color-text-muted:     #8c8078;  /* placeholders, hints */
  --color-text-disabled:  #b8b0a8;

  /* Accent — warm coffee brown, used sparingly */
  --color-accent:         #7c5c3e;  /* primary interactive: links, focus, selection */
  --color-accent-light:   #a07850;  /* hover state on accent elements */
  --color-accent-subtle:  #e8ddd0;  /* accent-tinted backgrounds (citation chips, etc.) */

  /* Semantic */
  --color-success:  #4a7c59;  /* muted green */
  --color-warning:  #9c7a2e;  /* muted amber */
  --color-error:    #9c3e3e;  /* muted red */
  --color-info:     #3e6b9c;  /* muted blue */

  /* Borders */
  --color-border-subtle:  #e0d8ce;  /* almost invisible separators */
  --color-border-default: #ccc4b8;  /* panel edges, input borders */
  --color-border-strong:  #a89c90;  /* emphasis borders */

  /* Editor-specific */
  --color-equation-bg:        #f5f0e8;  /* equation block background tint */
  --color-cite-chip-bg:       #e8ddd0;  /* inline citation pill */
  --color-cite-chip-border:   #c8b8a0;
  --color-annotation-open:    #c89a30;  /* amber margin badge */
  --color-annotation-resolved:#4a7c59;  /* green */
  --color-annotation-critical:#9c3e3e;  /* red */
  --color-selection:          rgba(124, 92, 62, 0.18); /* text selection */
}
```

### Dark Theme

```css
[data-theme="dark"] {
  --color-bg-canvas:    #1a1612;   /* warm very dark brown, not pure black */
  --color-bg-surface:   #221e19;
  --color-bg-overlay:   #2a2520;
  --color-bg-hover:     #302b25;
  --color-bg-active:    #3a342d;

  --color-text-primary:   #e8e0d4;  /* warm off-white */
  --color-text-secondary: #b8a898;
  --color-text-muted:     #887870;
  --color-text-disabled:  #58504a;

  --color-accent:         #c8956a;  /* warm amber-gold in dark mode */
  --color-accent-light:   #d8a880;
  --color-accent-subtle:  #3a2e24;

  --color-success:  #6aab80;
  --color-warning:  #c8a050;
  --color-error:    #c86868;
  --color-info:     #6898c8;

  --color-border-subtle:  #2e2820;
  --color-border-default: #3e3830;
  --color-border-strong:  #5e5448;

  --color-equation-bg:        #221e18;
  --color-cite-chip-bg:       #3a2e24;
  --color-cite-chip-border:   #5e4e38;
  --color-annotation-open:    #c8a050;
  --color-annotation-resolved:#6aab80;
  --color-annotation-critical:#c86868;
  --color-selection:          rgba(200, 149, 106, 0.22);
}
```

Dark mode is toggled by system `prefers-color-scheme` by default, with a manual override
stored in user preferences. Set `data-theme="dark"` on `<html>`.

---

## 3. Typography

Fonts reinforce the coffee shop / academic writing aesthetic. Import from Google Fonts or
bundle locally.

| Role | Font | Fallback |
|---|---|---|
| UI chrome | `Lato` | `-apple-system, BlinkMacSystemFont, sans-serif` |
| Editor body | `Lora` | `Georgia, 'Times New Roman', serif` |
| Monospace | `JetBrains Mono` | `'Fira Code', 'Courier New', monospace` |

**Why these choices:** Lato is clean and neutral for interface elements. Lora is a serif with
strong calligraphic roots that reads warmly on screen — it feels like a book, not a terminal.
JetBrains Mono for all code and raw LaTeX.

### Type Scale

```css
--text-xs:   11px;
--text-sm:   13px;
--text-base: 15px;
--text-lg:   17px;
--text-xl:   20px;
--text-2xl:  24px;
--text-3xl:  30px;
```

### Line Heights

- UI elements: `1.4`
- Editor body: `1.85` — generous, book-like
- Monospace blocks: `1.6`

### Editor Heading Sizes (mapped to document structure)

| Node type | Size | Weight | Style |
|---|---|---|---|
| Chapter | `--text-3xl` | 600 | normal |
| Section | `--text-2xl` | 600 | normal |
| Subsection | `--text-xl` | 500 | normal |
| Subsubsection | `--text-lg` | 500 | italic |

---

## 4. Spacing Scale

All spacing uses this token scale. No arbitrary pixel values in components.

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

---

## 5. Component Patterns

### Toolbar

- Height: 44px
- Background: `--color-bg-surface` with a `1px` bottom border in `--color-border-subtle`
- Icon buttons only; labels appear in a tooltip on hover (300ms delay)
- Icon size: 18px, stroke 1.5px, color `--color-text-secondary`
- Active/toggled state: icon color becomes `--color-accent`; no background fill
- Grouped buttons have `8px` gap between groups, `1px` separator line

### Sidebar Panels

- Default width: 280px, user-resizable
- Background: `--color-bg-surface`
- Right border: `1px solid --color-border-default`
- Section headers: `--text-xs`, uppercase, letter-spacing `0.08em`, color `--color-text-muted`,
  `--space-4` padding
- List items: `--space-3` vertical, `--space-4` horizontal padding; hover background
  `--color-bg-hover`; active background `--color-bg-active`
- No box shadows anywhere — borders only

### Modals

- Backdrop: `rgba(26, 22, 18, 0.55)` — warm dark tint, not flat black
- Panel: `--color-bg-overlay`, max-width 560px, centered
- Border: `1px solid --color-border-default`
- Border-radius: `6px`
- Header: `--text-lg`, font-weight 500, `--space-5` padding, bottom border
- Footer: right-aligned actions, `--space-4` padding, top border
- Close button: top-right corner, ghost style

### Input Fields

- Border: `1px solid --color-border-default`
- Background: transparent (inherits surface)
- Border-radius: `4px`
- Height: 32px compact / 36px default
- Focus: border becomes `--color-accent`, no glow/shadow
- Placeholder: `--color-text-muted`
- Font: `--text-sm`, Lato

### Buttons

Three variants, no shadows, max `4px` border-radius:

| Variant | Background | Border | Text |
|---|---|---|---|
| Primary | `--color-accent` | none | white |
| Secondary | transparent | `1px --color-border-default` | `--color-text-primary` |
| Ghost | transparent | none | `--color-text-secondary` |

Hover: Primary lightens to `--color-accent-light`; Secondary gets `--color-bg-hover` fill;
Ghost gets `--color-bg-hover` fill. All transitions: `150ms ease`.

### Citation Chips

Inline pill: background `--color-cite-chip-bg`, border `1px solid --color-cite-chip-border`,
border-radius `3px`, `--text-xs` JetBrains Mono, `2px 6px` padding. Clicking opens the bib
entry panel. Unresolved keys: border color `--color-error`.

### Annotation Margin Badges

8px filled circle in the gutter left of the annotated block:

- Open: `--color-annotation-open`
- Resolved: `--color-annotation-resolved`
- Critical: `--color-annotation-critical`

Hovering expands to show author and first line of comment.

### Equation Nodes

- Block equations: `--color-equation-bg` background, `4px` border-radius, `--space-4`
  vertical padding, `--space-6` horizontal. A subtle left border (`3px solid
  --color-border-subtle`) indicates it's a distinct block — no full box border.
- Inline equations: no background, blend into Lora body text
- Edit state: monospace source in JetBrains Mono above a hairline separator, KaTeX preview below

### Status Bar

- Height: 24px
- Background: `--color-bg-surface`, `1px` top border `--color-border-subtle`
- Font: `--text-xs`, Lato, `--color-text-muted`
- Left section: filename, autosave dot indicator (green pulse when saving)
- Right section: word count | cursor position | compile status | milestone countdown
- Compile spinner: simple CSS border rotation, `--color-accent` colored

---

## 6. Editor Canvas

The canvas is the most important surface in the app. Protect it.

- Maximum content width: **680px**, centered horizontally
- Canvas background: `--color-bg-canvas` — the entire window is this color in light mode;
  no distinction between "canvas" and "margin"
- Top padding: `80px` — gives breathing room before the first line
- Bottom padding: `120px` — lets the user scroll comfortably past the last word
- Block node vertical margin: `--space-6` between all block-level nodes
- Paragraph: Lora 16px, line-height 1.85, `--color-text-primary`
- No visible block node borders except equations and code blocks
- Text selection: `--color-selection`

---

## 7. Motion and Animation

Keep it minimal. The app should feel fast, not animated.

- Hover state transitions: `150ms ease`
- Panel slide in/out: `200ms ease`
- No spring physics, no bounce, no morphing
- No entrance animations on page load
- Avoid `transition: all` — always specify exact properties
- The only persistent animation is the autosave pulse dot in the status bar (slow, subtle)

---

## 8. Icons

Use `lucide-react` exclusively.

- Size: 18px in toolbar, 16px in sidebar, 14px in dense/inline contexts
- Stroke width: `1.5px` always
- Color: inherits from `--color-text-secondary` unless in an active state
- Never use filled variants
- Never exceed 20px except in empty-state illustrations
- All icon-only buttons must have `aria-label` and a tooltip

---

## 9. Dark Mode

Dark mode is a first-class feature, not an afterthought.

- Default: follows `prefers-color-scheme`
- Override: stored in user preferences, applied via `data-theme="dark"` on `<html>`
- Canvas in dark mode: `#1a1612` — warm dark brown, not black
- Text in dark mode: `#e8e0d4` — warm off-white, not white
- The warmth of the palette must be preserved in dark mode — use the tokens defined in
  Section 2, do not invent new colors

---

## 10. Accessibility

- Minimum contrast ratio: 4.5:1 for all body text, 3:1 for large text and UI components
- All interactive elements: visible focus ring — `2px solid --color-accent`, `2px offset`
- Never use color alone to convey state; always pair with icon or label
- All icon-only buttons: `aria-label` required
- Full keyboard navigation for all panels and modals
- The editor must be navigable without a mouse

---

## 11. What NOT To Do

Treat this as a hard constraint list:

- No gradients, anywhere
- No `box-shadow` on panels or cards — use borders
- No pure white (`#ffffff`) or pure black (`#000000`) backgrounds
- No colored sidebar item backgrounds unless selected
- No full-width primary buttons
- No animations on page load or route change
- No custom scrollbars
- No `border-radius` above `6px`
- No `font-weight` above `600`
- No emoji in UI labels or headings
- No neon or saturated semantic colors — keep them muted
- Do not use the accent color for more than ~10% of any visible surface
- Do not add decorative dividers, illustrations, or patterns to functional UI
- Do not use `transition: all`
