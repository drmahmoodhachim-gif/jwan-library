# Jwan's Library

**→ [Open the interactive library](https://drmahmoodhachim-gif.github.io/jwan-library/) ←**

A personal interactive library web app for organizing books, papers, notes, and resources. Built for GitHub Pages.

## Features

- **Add & organize** items by category (Books, Papers, Notes, Resources)
- **Search** across title, author, and notes
- **Filter** by category
- **Track status** (To read, Reading, Read, Reference)
- **Store links** to online resources
- **Persistent storage** — data saved in your browser (localStorage)
- **Edit & delete** items

## Deploy to GitHub Pages

1. **Create a new GitHub repository**
   - Go to [github.com/new](https://github.com/new)
   - Name it `jwan-library` (or any name)
   - Choose Public, leave "Add a README" unchecked
   - Create repository

2. **Push this project to GitHub**

   ```bash
   cd jwan-library
   git init
   git add .
   git commit -m "Initial commit: Jwan's Library"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/jwan-library.git
   git push -u origin main
   ```

   Replace `YOUR-USERNAME` with your GitHub username.

3. **Enable GitHub Pages**
   - Open your repo on GitHub
   - Go to **Settings** → **Pages**
   - Under "Source", select **Deploy from a branch**
   - Branch: **main**, folder: **/ (root)**
   - Save

4. **Wait 1–2 minutes**, then visit:
   ```
   https://YOUR-USERNAME.github.io/jwan-library/
   ```

## Run locally

Open `index.html` in a browser, or use a local server:

```bash
npx serve .
```

Then open `http://localhost:3000`.

## How to use

- **Add Item** — Add books, papers, notes, or resources with title, author, link, and notes
- **Search** — Type to search across all fields
- **Categories** — Filter by Books, Papers, Notes, or Resources
- **Edit/Delete** — Hover over a card to reveal edit and delete buttons
- **Data** — Stored in your browser; each device/browser has its own library

---

Made for Jwan 📚
