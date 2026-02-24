// Jwan's Book Nook - Personalization settings + dynamic library data
// Reads items from the shared localStorage key used by the main library.

const SETTINGS_KEY = 'jwan-book-nook-settings';
const LIBRARY_KEY = 'jwan-library-items';

const FONT_SIZES = { small: 14, medium: 16, large: 18 };
const LINE_SPACING = { normal: 1.4, relaxed: 1.6, extra: 1.8 };

let currentFont = 'medium';
let currentSpacing = 'relaxed';

// ----------- Display settings -----------

function apply() {
  document.documentElement.style.setProperty('--font-size', FONT_SIZES[currentFont] + 'pt');
  document.documentElement.style.setProperty('--line-height', LINE_SPACING[currentSpacing]);
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ currentFont, currentSpacing }));
  updateButtonStates();
}

function updateButtonStates() {
  document.querySelectorAll('.settings-item button').forEach(btn => btn.classList.remove('active'));
  document.getElementById('font-' + currentFont)?.classList.add('active');
  document.getElementById('space-' + currentSpacing)?.classList.add('active');
}

function loadSettings() {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) {
    try {
      const s = JSON.parse(saved);
      if (s.currentFont) currentFont = s.currentFont;
      if (s.currentSpacing) currentSpacing = s.currentSpacing;
    } catch (e) {}
  }
  apply();
}

document.getElementById('font-small').addEventListener('click', () => { currentFont = 'small'; apply(); });
document.getElementById('font-medium').addEventListener('click', () => { currentFont = 'medium'; apply(); });
document.getElementById('font-large').addEventListener('click', () => { currentFont = 'large'; apply(); });
document.getElementById('space-normal').addEventListener('click', () => { currentSpacing = 'normal'; apply(); });
document.getElementById('space-relaxed').addEventListener('click', () => { currentSpacing = 'relaxed'; apply(); });
document.getElementById('space-extra').addEventListener('click', () => { currentSpacing = 'extra'; apply(); });

// ----------- Dynamic library data -----------

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star${i <= rating ? ' filled' : ''}">★</span>`;
  }
  return html;
}

function getLibraryItems() {
  try {
    return JSON.parse(localStorage.getItem(LIBRARY_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function renderCurrentRead() {
  const container = document.getElementById('current-read-container');
  if (!container) return;

  const items = getLibraryItems();
  const reading = items.filter(item => item.status === 'reading');

  if (reading.length === 0) {
    container.innerHTML = '<p class="empty-note">No books currently being read. Mark a book as "Reading" in <a href="index.html">Jwan\'s Library</a> to see it here.</p>';
    return;
  }

  container.innerHTML = reading.map(item => `
    <div class="current-read-content">
      <div class="current-read-cover">
        <div class="cover-placeholder">📖</div>
      </div>
      <div class="current-read-text">
        <h3>${escapeHtml(item.title)}</h3>
        ${item.author ? `<p class="current-author">${escapeHtml(item.author)}</p>` : ''}
        ${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : ''}
      </div>
    </div>
  `).join('');
}

function renderReviews() {
  const container = document.getElementById('reviews-container');
  if (!container) return;

  const items = getLibraryItems();
  const reviewed = items.filter(item => item.status === 'read' && (item.notes || item.rating));

  if (reviewed.length === 0) {
    container.innerHTML = '<p class="empty-note">No reviews yet. Mark books as "Read" and add notes and a rating in <a href="index.html">Jwan\'s Library</a> to see reviews here.</p>';
    return;
  }

  const icons = ['📖', '🔍', '📕', '📗', '📘', '📙'];

  container.innerHTML = reviewed.map((item, i) => {
    const icon = icons[i % icons.length];
    const rating = item.rating || 0;
    const notesParagraphs = item.notes
      ? item.notes.split('\n').filter(Boolean).map(line => `<p>${escapeHtml(line)}</p>`).join('')
      : '';

    return `
      <article class="review-card">
        <div class="review-card-header">
          <span class="review-icon" aria-hidden="true">${icon}</span>
          <div>
            <h3 class="review-title">${escapeHtml(item.title)}</h3>
            ${item.author ? `<p class="review-author">${escapeHtml(item.author)}</p>` : ''}
          </div>
        </div>
        ${rating > 0 ? `<div class="review-rating" aria-label="Rating: ${rating} out of 5 stars">${renderStars(rating)}</div>` : ''}
        ${notesParagraphs ? `<div class="review-text">${notesParagraphs}</div>` : ''}
      </article>
    `;
  }).join('');
}

function renderLibraryData() {
  renderCurrentRead();
  renderReviews();
}

// ----------- Init -----------
loadSettings();
renderLibraryData();
