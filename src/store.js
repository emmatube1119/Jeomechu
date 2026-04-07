// src/store.js
// 데이터 저장소: 오직 LocalStorage 보관 로직만 담당합니다. (UI 의존성 제거)

export const STORAGE_FAQS = 'jemechu_favorites';
export const STORAGE_WEIGHTS = 'jemechu_weights';

// User Action Storage (Like/Dislike 가중치)
export function updateWeight(menuName, delta) {
  try {
    let weights = JSON.parse(localStorage.getItem(STORAGE_WEIGHTS) || '{}');
    weights[menuName] = (weights[menuName] || 1.0) + delta;
    if (weights[menuName] < 0.1) weights[menuName] = 0.1;
    localStorage.setItem(STORAGE_WEIGHTS, JSON.stringify(weights));
  } catch (e) {
    console.error('Failed to update weight', e);
  }
}

export function getWeight(menuName) {
  try {
    let weights = JSON.parse(localStorage.getItem(STORAGE_WEIGHTS) || '{}');
    return weights[menuName] !== undefined ? weights[menuName] : 1.0;
  } catch (e) {
    return 1.0;
  }
}

// Favorites Storage (즐겨찾기 보관함)
export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_FAQS) || '[]');
  } catch (e) {
    return [];
  }
}

export function toggleFavorite(menuObj) {
  let favs = getFavorites();
  const existsIndex = favs.findIndex(m => m.name === menuObj.name);
  let added = false;
  
  if (existsIndex > -1) {
    favs.splice(existsIndex, 1);
    added = false;
  } else {
    favs.push(menuObj);
    added = true;
  }
  
  localStorage.setItem(STORAGE_FAQS, JSON.stringify(favs));
  return added; // 추가되었으면 true, 제거되었으면 false 반환
}

export function isFavorite(menuName) {
  return getFavorites().some(m => m.name === menuName);
}

export function clearFavorites() {
  localStorage.removeItem(STORAGE_FAQS);
}
