// Jwan's Library - Interactive Library App
// Data persists in localStorage

const STORAGE_KEY = 'jwan-library-items';

let items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentCategory = 'all';
let searchQuery = '';

const elements = {
  library: document.getElementById('library'),
  emptyState: document.getElementById('empty-state'),
  search: document.getElementById('search'),
  searchBtn: document.getElementById('search-btn'),
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
        ? 'Click "Add Item" to start building your collection' 
        : 'No items match your search or filter';
    return;
  }

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

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function openModal(editId = null) {
  elements.modal.classList.add('open');
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
  } else {
    elements.modalTitle.textContent = 'Add Item';
    elements.itemForm.reset();
    elements.itemId.value = '';
  }
}

function closeModal() {
  elements.modal.classList.remove('open');
}

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
    showToast('Item added');
  }
  save();
  renderCards();
  closeModal();
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
  renderCards();
});
elements.search.addEventListener('keydown', e => {
  if (e.key === 'Enter') e.preventDefault();
});
elements.searchBtn.addEventListener('click', () => renderCards());

elements.clearSearch.addEventListener('click', () => {
  elements.search.value = '';
  searchQuery = '';
  document.querySelector('.category-btn.active')?.classList.remove('active');
  document.querySelector('[data-category="all"]').classList.add('active');
  currentCategory = 'all';
  renderCards();
});

renderCards();
