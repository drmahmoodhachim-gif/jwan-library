// Jwan's Library - Interactive Library App
// Data persists in localStorage
// Book search via Open Library API (free, no key)

const STORAGE_KEY = 'jwan-library-items';
const OPEN_LIBRARY_API = 'https://openlibrary.org/search.json';

let items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentCategory = 'all';
let searchQuery = '';
let currentView = 'library'; // 'library' | 'search'
let bookSearchResults = [];
let searchTimeout = null;

const elements = {
  library: document.getElementById('library'),
  emptyState: document.getElementById('empty-state'),
  bookSearchResults: document.getElementById('book-search-results'),
  search: document.getElementById('search'),
  searchBtn: document.getElementById('search-btn'),
  searchHint: document.getElementById('search-hint'),
  addItem: document.getElementById('add-item'),
  clearSearch: document.getElementById('clear-search'),
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

// ----------- Open Library API Search -----------
async function searchBooks(query) {
  if (!query.trim()) return;
  const q = encodeURIComponent(query.trim());
  elements.bookSearchResults.innerHTML = '<div class="search-loading">Searching books...</div>';
  elements.bookSearchResults.classList.add('visible');
  try {
    const apiUrl = `${OPEN_LIBRARY_API}?q=${q}&limit=20`;
    const res = await fetch('https://corsproxy.io/?' + encodeURIComponent(apiUrl));
    const data = await res.json();
    bookSearchResults = (data.docs || []).slice(0, 12);
    renderBookSearchResults();
  } catch (err) {
    elements.bookSearchResults.innerHTML = '<div class="search-empty">Could not reach book search. Please try again.</div>';
  }
}

function renderBookSearchResults() {
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
  document.getElementById('notes-label').textContent = 'Your summary (optional)';
  document.getElementById('notes').placeholder = 'Write your summary of this book...';
}

// ----------- Library view -----------
function filterItems() {
  return items.filter(item => {
    const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
    const matchesSearch = !searchQuery ||
      [item.title, item.author, item.notes].some(field =>
        field && field.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });
}

function renderCards() {
  const filtered = filterItems();

  elements.itemCount.textContent = `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`;

  if (searchQuery || currentCategory !== 'all') {
    elements.statusFilter.textContent = searchQuery
      ? `"${searchQuery}"`
      : `Category: ${currentCategory}`;
  } else {
    elements.statusFilter.textContent = '';
  }

  if (filtered.length === 0) {
    elements.library.innerHTML = '';
    elements.emptyState.classList.add('visible');
    elements.emptyState.querySelector('.empty-hint').textContent =
      items.length === 0
        ? 'Search books above or click "Add Item" to start'
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
          ${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="card-link">🔗</a>` : ''}
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
  document.getElementById('notes-label').textContent = 'Summary / Notes';
  document.getElementById('notes').placeholder = 'Your thoughts, summary, key takeaways...';

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

function switchView(view) {
  currentView = view;
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  elements.library.closest('.main').classList.toggle('show-library', view === 'library');
  elements.library.closest('.main').classList.toggle('show-search', view === 'search');
  if (view === 'library') {
    elements.bookSearchResults.classList.remove('visible');
    elements.search.placeholder = 'Search your library...';
    elements.searchHint.textContent = '';
    renderCards();
  } else {
    elements.search.placeholder = 'Search Open Library for books...';
    elements.searchHint.textContent = 'Searches millions of books. Click a book to add it with your summary.';
    elements.search.value = '';
    searchQuery = '';
    bookSearchResults = [];
    elements.bookSearchResults.classList.remove('visible');
    renderCards();
  }
}

// ----------- Event listeners -----------
elements.addItem.addEventListener('click', () => openModal());
document.getElementById('add-item-mobile')?.addEventListener('click', () => openModal());

elements.modalClose.addEventListener('click', closeModal);
elements.formCancel.addEventListener('click', closeModal);

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
  if (currentView === 'search') {
    elements.bookSearchResults.classList.remove('visible');
  }
});

document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.category-btn.active')?.classList.remove('active');
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    renderCards();
  });
});

elements.search.addEventListener('input', () => {
  searchQuery = elements.search.value.trim();
  if (currentView === 'library') {
    renderCards();
  } else {
    clearTimeout(searchTimeout);
    if (searchQuery.length >= 2) {
      searchTimeout = setTimeout(() => searchBooks(searchQuery), 400);
    } else {
      elements.bookSearchResults.classList.remove('visible');
    }
  }
});

elements.search.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (currentView === 'search' && searchQuery) {
      searchBooks(searchQuery);
    }
  }
});

elements.searchBtn.addEventListener('click', () => {
  if (currentView === 'search') {
    searchBooks(elements.search.value.trim());
  } else {
    renderCards();
  }
});

elements.clearSearch.addEventListener('click', () => {
  elements.search.value = '';
  searchQuery = '';
  document.querySelector('.category-btn.active')?.classList.remove('active');
  document.querySelector('[data-category="all"]')?.classList.add('active');
  currentCategory = 'all';
  if (currentView === 'search') {
    elements.bookSearchResults.classList.remove('visible');
  }
  renderCards();
});

// Init
renderCards();
