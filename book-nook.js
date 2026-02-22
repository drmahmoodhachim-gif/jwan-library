// Jwan's Book Nook - Personalization settings
// Simple buttons, no dropdowns. Saves preferences to localStorage.

const STORAGE_KEY = 'jwan-book-nook-settings';

const FONT_SIZES = { small: 14, medium: 16, large: 18 };
const LINE_SPACING = { normal: 1.4, relaxed: 1.6, extra: 1.8 };

let currentFont = 'medium';
let currentSpacing = 'relaxed';

function apply() {
  document.documentElement.style.setProperty('--font-size', FONT_SIZES[currentFont] + 'pt');
  document.documentElement.style.setProperty('--line-height', LINE_SPACING[currentSpacing]);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentFont, currentSpacing }));
  updateButtonStates();
}

function updateButtonStates() {
  document.querySelectorAll('.settings-item button').forEach(btn => btn.classList.remove('active'));
  document.getElementById('font-' + currentFont)?.classList.add('active');
  document.getElementById('space-' + currentSpacing)?.classList.add('active');
}

function load() {
  const saved = localStorage.getItem(STORAGE_KEY);
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

load();
