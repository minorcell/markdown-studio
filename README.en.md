# Markdown Studio

[中文说明 (README.md)](README.md) · English version

A lightweight, browser-based Markdown editing and preview demo. No build or backend required — just open locally in your browser.

- Live preview: what-you-see-is-what-you-get
- View modes: Edit only / Split view / Preview only
- Code highlighting: integrated highlight.js (GitHub theme)
- Keyboard support: Tab indent, Shift+Tab outdent; works with multi-line selections
- Export: one-click export to `.md` or self-contained `.html`
- Local persistence: auto-saves to `localStorage`, content survives refresh

## Online / Local Usage

- Double-click or drag `index.html` into your browser to start.
- The first launch loads a sample doc; subsequent launches restore your last content.

> Note: Code highlighting in preview/export is loaded via CDN (`highlight.js`). Ensure network access to the CDN.

## Feature Overview

- Markdown parsing: headings, paragraphs, bold/italic, strikethrough, inline code, code blocks, blockquotes, unordered/ordered lists, links and images.
- View modes:
  - `Edit only`: focus on writing
  - `Split`: side-by-side editor and preview
  - `Preview only`: focus on reading
- Export:
  - `Export Markdown`: auto-generates a safe filename from the document title and downloads a `.md` file
  - `Export HTML`: generates a standalone HTML file with inlined styles and code highlighting
- Editing UX:
  - Tab inserts indentation; Shift+Tab removes indentation
  - Multi-line selections support batch indent/outdent; cursor and selection update appropriately
- Persistence:
  - Automatically saves content to `localStorage` under the `markdown-studio-content` key
  - Remembers sidebar visibility
  - Restores the last opened directory (uses the File System Access API + IndexedDB; if permission is granted, the directory will auto-restore on load)

## Quick Start

1. Clone or download this repository
2. Open `index.html` in your browser
3. Type Markdown on the left, see live preview on the right
4. Use the toolbar to switch view modes or export files

## Project Structure

```
web-demos/
├─ index.html     # App entry (Chinese UI, toolbar and split layout)
├─ styles.css     # UI styles (split layout, preview styles, code area styles)
├─ main.js        # Parsing, rendering, view switching, export, and keyboard UX
└─ README.en.md   # This document (English)
```

## Technical Notes

- Parsing: custom lightweight rules for common Markdown features to avoid large bundles
- Highlighting: `highlight.js` via CDN, highlights code blocks by language
- Filenames: generated from the first heading or first line, unsafe characters are sanitized
- Security: export via `Blob` and browser download; HTML is escaped during render to reduce XSS risks

## Compatibility

- Modern desktop browsers (Chrome, Edge, Firefox, Safari) are supported
- Mobile devices can open it, but editing UX is limited; desktop is recommended

## FAQ

- Tables: native table Markdown is not built in yet, but exported HTML includes table styles; parsing can be extended later
- Network access: preview highlighting relies on CDN; for restricted networks, switch CDN or use offline local copies of scripts/styles

## Contributing

Issues and PRs are welcome to improve parsing, interaction, and styling.
