# AGENTS.md

## Cursor Cloud specific instructions

This is a **static HTML/CSS/JavaScript** project with no build step, no framework, and no backend. All tooling is in `package.json` as dev dependencies.

### Project structure

All files live in the repository root (flat structure):

| Page | Files | Description |
|------|-------|-------------|
| Jwan's Library (main) | `index.html`, `script.js`, `styles.css` | Interactive library app with CRUD, search, filtering |
| Jwan's Book Nook | `book-nook.html`, `book-nook.js`, `book-nook.css` | Static book review/profile page |

### Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (serves on port 3000) |
| JS lint | `npm run lint` |
| HTML lint | `npm run lint:html` |
| All checks | `npm run validate` |

### Notes

- `firebase-config.js` exists but is **not loaded** by any HTML page — it is unused.
- Data is stored in the browser's `localStorage` (key: `jwan-library-items`). There is no backend or database.
- HTML validation warnings (missing `type` on buttons, `aria-label` usage) are pre-existing in the original HTML and are set to `warn` level rather than `error`.
- ESLint is configured for browser globals (`sourceType: "script"`) since JS files are loaded via `<script>` tags, not ES modules.
