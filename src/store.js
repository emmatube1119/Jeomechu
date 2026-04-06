import { showToast } from './ui.js';

export const STORAGE_FAQS = 'jemechu_favorites';
export const STORAGE_WEIGHTS = 'jemechu_weights';

// User Action Storage (Like/Dislike)
export function updateWeight(menuName, delta) {
  let weights = JSON.parse(localStorage.getItem(STORAGE_WEIGHTS) || '{}');
  weights[menuName] = (weights[menuName] || 1.0) + delta;
  if (weights[menuName] < 0.1) weights[menuName] = 0.1;
  localStorage.setItem(STORAGE_WEIGHTS, JSON.stringify(weights));
}

export function getWeight(menuName) {
  let weights = JSON.parse(localStorage.getItem(STORAGE_WEIGHTS) || '{}');
  return weights[menuName] !== undefined ? weights[menuName] : 1.0;
}

// Favorites Storage
export function getFavorites() {
  return JSON.parse(localStorage.getItem(STORAGE_FAQS) || '[]');
}

export function toggleFavorite(menuObj, renderCallback) {
  let favs = getFavorites();
  const exists = favs.findIndex(m => m.name === menuObj.name);
  if (exists > -1) {
    favs.splice(exists, 1);
    showToast('보관함에서 제거되었습니다.');
  } else {
    favs.push(menuObj);
    showToast('보관함에 저장되었습니다 ⭐');
  }
  localStorage.setItem(STORAGE_FAQS, JSON.stringify(favs));
  
  if(renderCallback) renderCallback();
  
  return exists === -1; // true if added
}

export function isFavorite(menuName) {
  return getFavorites().some(m => m.name === menuName);
}

export function clearFavorites(renderCallback) {
  localStorage.removeItem(STORAGE_FAQS);
  if(renderCallback) renderCallback();
}
