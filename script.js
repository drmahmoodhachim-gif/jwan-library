// Jwan's Library - Internet search + Local collection
// Book search via Open Library API (CORS proxy)

const STORAGE_KEY = 'jwan-library-items';
const OPEN_LIBRARY_API = 'https://openlibrary.org/search.json';

let items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentCategory = 'all';
let localSearchQuery = '';
let bookSearchResults = [];

const elements = {
  library: document.getElementById('library'),
  emptyState: document.getElementById('empty-state'),
  bookSearchResults: document.getElementById('book-search-results'),
  internetSearch: document.getElementById('internet-search'),
  internetSearchBtn: document.getElementById('internet-search-btn'),
  localSearch: document.getElementById('local-search'),
  addItem: document.getElementById('add-item'),
  modal: document.getElementById('modal'),
  modalClose: document.getElementById('modal-close'),
  modalTitle: document.getElementById('modal-title'),
  itemForm: document.getElementById('item-form'),
  itemId: document.getElementById('item-id'),
  formCancel: document.getElementById('form-cancel'),
  itemCount: document.getElementById('item-count'),
  statusFilter: document.getElementById('status-filter'),
  toast: document.getElementById('toast'),
};

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function showToast(msg) {
  elements.toast.textContent = msg;
  elements.toast.classList.add('show');
  setTimeout(() => elements.toast.classList.remove('show'), 2500);
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ----------- Internet Search (Open Library) -----------
async function searchBooks(query) {
  if (!query.trim()) return;
  const q = encodeURIComponent(query.trim());
  if (!elements.bookSearchResults) return;
  elements.bookSearchResults.innerHTML = '<div class="search-loading">Searching books...</div>';
  elements.bookSearchResults.classList.add('visible');
  try {
    const apiUrl = `${OPEN_LIBRARY_API}?q=${q}&limit=20`;
    const encoded = encodeURIComponent(apiUrl);
    let res = await fetch('https://corsproxy.io/?' + encoded);
    if (!res.ok) res = await fetch('https://api.cors.lol/?url=' + encoded);
    const data = await res.json();
    bookSearchResults = (data.docs || []).slice(0, 12);
    renderBookSearchResults();
  } catch (err) {
    console.error('Book search error:', err);
    elements.bookSearchResults.innerHTML = '<div class="search-empty">Could not reach book search. Try again.</div>';
  }
}

function renderBookSearchResults() {
  if (!elements.bookSearchResults) return;
  if (bookSearchResults.length === 0) {
    elements.bookSearchResults.innerHTML = '<div class="search-empty">No books found. Try a different search.</div>';
    return;
  }
  elements.bookSearchResults.innerHTML = bookSearchResults.map(book => {
    const title = book.title || 'Unknown';
    const authors = book.author_name ? book.author_name.join(', ') : '';
    const coverId = book.cover_i;
    const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null;
    return `
      <div class="search-result-card" data-index="${bookSearchResults.indexOf(book)}">
        ${coverUrl 
          ? `<img class="cover" src="${coverUrl}" alt="${escapeHtml(title)}">` 
          : `<div class="cover-placeholder">📖</div>`}
        <div class="info">
          <h3 class="info-title">${escapeHtml(title)}</h3>
          ${authors ? `<p class="info-author">${escapeHtml(authors)}</p>` : ''}
          <button type="button" class="add-btn">+ Add to Library</button>
        </div>
      </div>
    `;
  }).join('');

  elements.bookSearchResults.querySelectorAll('.search-result-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.classList.contains('add-btn')) return;
      const idx = parseInt(card.dataset.index);
      addBookFromSearch(bookSearchResults[idx]);
    });
  });
  elements.bookSearchResults.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const card = btn.closest('.search-result-card');
      const idx = parseInt(card.dataset.index);
      addBookFromSearch(bookSearchResults[idx]);
    });
  });
}

function addBookFromSearch(book) {
  const title = book.title || 'Unknown';
  const author = book.author_name ? book.author_name.join(', ') : '';
  const key = book.key ? `https://openlibrary.org${book.key}` : null;
  openModal(null, { title, author, url: key });
  const notesLabel = document.getElementById('notes-label');
  const notesField = document.getElementById('notes');
  if (notesLabel) notesLabel.textContent = 'Your summary (optional)';
  if (notesField) notesField.placeholder = 'Write your summary of this book...';
}

// ----------- Local Library -----------
function filterItems() {
  return items.filter(item => {
    const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
    const matchesSearch = !localSearchQuery ||
      [item.title, item.author, item.notes].some(field =>
        field && field.toLowerCase().includes(localSearchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });
}

function renderCards() {
  const filtered = filterItems();
  elements.itemCount.textContent = `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`;
  if (localSearchQuery || currentCategory !== 'all') {
    elements.statusFilter.textContent = localSearchQuery
      ? `"${localSearchQuery}"`
      : `Category: ${currentCategory}`;
  } else {
    elements.statusFilter.textContent = '';
  }

  if (filtered.length === 0) {
    elements.library.innerHTML = '';
    elements.emptyState.classList.add('visible');
    elements.emptyState.querySelector('.empty-hint').textContent =
      items.length === 0
        ? 'Search the internet above to add books, or click "Add Item" for papers, notes, resources.'
        : 'No items match your search or filter';
  } else {
    elements.emptyState.classList.remove('visible');
    elements.library.innerHTML = filtered.map(item => `
      <article class="card" data-id="${item.id}">
        <div class="card-actions">
          <button type="button" class="edit-btn" aria-label="Edit">✎</button>
          <button type="button" class="delete-btn" aria-label="Delete">🗑</button>
        </div>
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        ${item.author ? `<p class="card-author">${escapeHtml(item.author)}</p>` : ''}
        ${item.notes ? `<p class="card-notes">${escapeHtml(item.notes)}</p>` : ''}
        <div class="card-meta">
          <span class="badge badge-${item.category}">${item.category}</span>
          <span class="badge badge-status">${item.status.replace('-', ' ')}</span>
          ${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">🔗</a>` : ''}
        </div>
      </article>
    `).join('');

    elements.library.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        openModal(btn.closest('.card').dataset.id);
      });
    });
    elements.library.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.closest('.card').dataset.id;
        if (confirm('Remove this item?')) {
          items = items.filter(i => i.id !== id);
          save();
          renderCards();
          showToast('Item removed');
        }
      });
    });
  }
}

function openModal(editId = null, bookData = null) {
  elements.modal.classList.add('open');
  const notesLabel = document.getElementById('notes-label');
  const notesField = document.getElementById('notes');
  if (notesLabel) notesLabel.textContent = 'Summary / Notes';
  if (notesField) notesField.placeholder = 'Your thoughts, summary, key takeaways...';

  if (editId) {
    const item = items.find(i => i.id === editId);
    if (item) {
      elements.modalTitle.textContent = 'Edit Item';
      elements.itemId.value = item.id;
      document.getElementById('title').value = item.title;
      document.getElementById('author').value = item.author || '';
      document.getElementById('category').value = item.category;
      document.getElementById('url').value = item.url || '';
      document.getElementById('notes').value = item.notes || '';
      document.getElementById('status').value = item.status || 'to-read';
    }
  } else if (bookData) {
    elements.modalTitle.textContent = 'Add to Library';
    elements.itemId.value = '';
    document.getElementById('title').value = bookData.title || '';
    document.getElementById('author').value = bookData.author || '';
    document.getElementById('category').value = 'books';
    document.getElementById('url').value = bookData.url || '';
    document.getElementById('notes').value = '';
    document.getElementById('notes').focus();
    document.getElementById('status').value = 'to-read';
  } else {
    elements.modalTitle.textContent = 'Add Item';
    elements.itemForm.reset();
    elements.itemId.value = '';
  }
}

function closeModal() {
  elements.modal.classList.remove('open');
}

// ----------- Event listeners -----------
elements.addItem.addEventListener('click', () => openModal());

elements.modalClose.addEventListener('click', closeModal);
elements.formCancel?.addEventListener('click', closeModal);
elements.modal.addEventListener('click', e => {
  if (e.target === elements.modal) closeModal();
});

elements.itemForm.addEventListener('submit', e => {
  e.preventDefault();
  const id = elements.itemId.value || 'id-' + Date.now();
  const item = {
    id,
    title: document.getElementById('title').value.trim(),
    author: document.getElementById('author').value.trim() || null,
    category: document.getElementById('category').value,
    url: document.getElementById('url').value.trim() || null,
    notes: document.getElementById('notes').value.trim() || null,
    status: document.getElementById('status').value,
  };
  const idx = items.findIndex(i => i.id === id);
  if (idx >= 0) {
    items[idx] = item;
    showToast('Item updated');
  } else {
    items.push(item);
    showToast('Added to library');
  }
  save();
  renderCards();
  closeModal();
});

// Internet search
elements.internetSearchBtn.addEventListener('click', () => {
  searchBooks(elements.internetSearch.value.trim());
});
elements.internetSearch.addEventListener('keydown', e => {
  if (e.key === 'Enter') searchBooks(elements.internetSearch.value.trim());
});

// Local search (filter library)
elements.localSearch.addEventListener('input', () => {
  localSearchQuery = elements.localSearch.value.trim();
  renderCards();
});

// Categories
document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    renderCards();
  });
});

// Init
renderCards();
