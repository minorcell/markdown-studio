# Markdown Studio

A lightweight, browser‑based Markdown editor and preview demo. No build steps or backend required — just open `index.html` locally.

- Live preview: see results as you type
- View modes: Editor‑only / Split / Preview‑only
- Code highlighting: powered by `highlight.js` (GitHub theme)
- Theme toggle: Light/Dark themes with persisted preference
- Keyboard support: Tab/Shift+Tab for indent/outdent, works with multi‑line selections
- Export: one‑click export to `.md` and self‑contained `.html`
- Local storage: auto‑save to `localStorage`
- Directory persistence: remembers opened directory with File System Access API + IndexedDB (requires user permission)

## Use Online / Locally

- Double‑click or drag `index.html` into your browser to use.
- The first launch loads a sample document; subsequent sessions restore your last content.
- If your browser supports the File System Access API (e.g., Chrome/Edge), opening a directory will be remembered; next time, the editor can re‑open it and list Markdown files (with your consent).

> Note: Code highlighting in preview/export uses a CDN for `highlight.js`. Ensure the CDN is reachable from your network.

## Features Overview

- Markdown parsing: headings, paragraphs, bold/italic/strikethrough, inline code, code blocks, blockquotes, lists, links, and images.
- View modes:
  - Editor‑only: focus on writing
  - Split: side‑by‑side editor and preview
  - Preview‑only: focus on reading
- Export:
  - Export Markdown: generates a safe filename based on the document title
  - Export HTML: produces a standalone HTML file with embedded styles and code highlighting enabled
- Editing experience:
  - Tab inserts indentation; Shift+Tab removes indentation
  - Multi‑line selections support batch indent/outdent with sensible cursor/selection updates
- Persistence:
  - Auto‑save content to `localStorage` under `markdown-studio-content`
  - Directory handle persistence via IndexedDB to restore previously opened folders (with permission)
- Theme:
  - Light/Dark toggle across landing and editor pages; swaps `highlight.js` theme accordingly

## Quick Start

1. Clone or download this repository
2. Open `index.html` in your browser
3. Type Markdown on the left; preview updates in real time on the right
4. Use the toolbar to switch view modes or export files

## Project Structure

```
web-demos/
├─ index.html       # Entry (Chinese UI, toolbar and split layout)
├─ styles/          # UI styles (landing and editor layouts, preview styles, code area, etc.)
├─ scripts/         # Parsing, rendering, view switching, export logic, theme toggle
├─ pages/editor.html# Full editor page
├─ README.md        # Chinese documentation
└─ README.en.md     # English documentation
```

## Technical Notes

- Parsing: custom lightweight rules for common Markdown features to keep the footprint small
- Highlighting: `highlight.js` via CDN, with theme swapping for light/dark
- Filenames: generated from the first heading or first line; unsafe characters are sanitized
- Security: export via `Blob` and browser download; HTML is escaped during rendering to reduce XSS risks

## Compatibility

- Modern desktop browsers (Chrome, Edge, Firefox, Safari)
- Mobile devices can open the app, but editing is best on desktop

## FAQ

- Tables: native Markdown table syntax isn’t fully supported in the custom parser yet. The exported HTML includes table styles; parsing can be extended later.
- Network access: preview highlighting depends on the CDN. If your network is limited, consider bundling or serving the scripts/styles locally.

## Contributing

Issues and PRs are welcome to improve parsing, UX, and styles.
