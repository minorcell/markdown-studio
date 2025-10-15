# Markdown Studio · [中文](README.md)

A lightweight Markdown editor demo you can open directly in your browser — no build, no backend.

## Highlights

- Live preview with Editor/Split/Preview modes
- Code highlighting via `highlight.js` (requires CDN access)
- Tab/Shift+Tab indent/outdent, works on multi‑line selections
- One‑click export to `.md` and standalone `.html`
- Auto‑save to `localStorage`; can remember opened directories (with permission)

## Usage

1. Clone or download the repo
2. Open `index.html` in your browser
3. Edit on the left, preview on the right; use the toolbar to switch modes or export

## Notes

- Custom lightweight parsing covering common Markdown
- Filenames derive from the first heading/line; unsafe chars sanitized
- HTML is escaped on render to reduce XSS risk

## Compatibility & Known Limits

- Works on modern desktop browsers; mobile editing experience is limited
- Markdown tables are partial; can be extended later

## Contributing

PRs and issues are welcome to improve parsing, UX, and styles.
