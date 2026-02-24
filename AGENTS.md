# AGENTS.md

## Cursor Cloud specific instructions

This is a **static HTML/CSS/JavaScript** project with no build system, no package manager, and no dependencies to install. There is no `package.json`, no bundler, and no transpilation step.

### Project structure

All files live in the repository root (flat structure):

| Page | Files | Description |
|------|-------|-------------|
| Jwan's Library (main) | `index.html`, `script.js`, `styles.css` | Interactive library app with CRUD, search, filtering |
| Jwan's Book Nook | `book-nook.html`, `book-nook.js`, `book-nook.css` | Static book review/profile page |

### Running locally

Serve the project root with any static file server:

```bash
npx serve . -l 3000
```

Then open `http://localhost:3000` (main library) or `http://localhost:3000/book-nook.html` (book nook).

### Lint / Test / Build

- **No linter, test framework, or build step** is configured. Changes are validated by opening the pages in a browser.
- `firebase-config.js` exists but is **not loaded** by any HTML page — it is unused.

### Data storage

All data is stored in the browser's `localStorage` (key: `jwan-library-items`). There is no backend or database.
