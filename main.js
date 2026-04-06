import './style.css';
import { MENUS } from './src/data.js';
import { updateWeight, isFavorite, toggleFavorite, renderFavorites, clearFavorites } from './src/store.js';
import { fetchWeather, getSmartFilteredMenus, fetchNearbyRestaurants } from './src/api.js';
import { showToast, shareResultImage } from './src/ui.js';

//=========================================
// 1. STATE & DOM ELEMENTS
//=========================================
let currentMode = 'random'; // random, mix, favorites
let currentCategory = 'all';
let selectedIngredient = '';
let selectedMethod = '';
let isSpinning = false;
let currentResultMenu = null;

const slotInner = document.getElementById('slot-inner');
const spinBtn = document.getElementById('spin-btn');
const resultModal = document.getElementById('result-modal');
const finalMenuEl = document.getElementById('final-menu');
const resultEmojiEl = document.getElementById('result-emoji');
const documentRoot = document.documentElement;

//=========================================
// 2. CORE LOGIC (Slot Machine)
//=========================================
function initSlot(category) {
  const filtered = category === 'all' 
    ? MENUS 
    : MENUS.filter(m => m.category.includes(category));
  
  if(filtered.length === 0) return;

  slotInner.innerHTML = '';
  // Ensure we have enough items for a visual scroll
  let items = [...filtered];
  while (items.length < 15) { items = items.concat(filtered); }
  
  items.forEach(menu => {
    const div = document.createElement('div');
    div.className = 'slot-item';
    div.innerHTML = `<span class="emoji">${menu.emoji}</span> ${menu.name}`;
    slotInner.appendChild(div);
  });
  
  slotInner.style.transition = 'none';
  slotInner.style.transform = 'translateY(0)';
  slotInner.classList.remove('spinning');
}

function spin() {
  if (isSpinning) return;
  
  let baseFiltered = [];
  if (currentMode === 'random') {
    baseFiltered = currentCategory === 'all' 
      ? MENUS 
      : MENUS.filter(m => m.category.includes(currentCategory));
  } else if (currentMode === 'mix') {
    if (!selectedIngredient || !selectedMethod) {
      showToast('주재료와 조리 방식을 먼저 선택해주세요!');
      return;
    }
    baseFiltered = MENUS.filter(m => m.ingredient === selectedIngredient && m.method === selectedMethod);
    if (baseFiltered.length === 0) {
      baseFiltered = MENUS.filter(m => m.ingredient === selectedIngredient || m.method === selectedMethod);
      showToast('정확히 일치하는 메뉴가 없어 비슷한 메뉴를 추천합니다.');
    }
  }

  if (baseFiltered.length === 0) {
    showToast('조건에 맞는 메뉴가 없습니다.');
    return;
  }

  // Applies weather/time/history weights via api.js
  const smartPool = getSmartFilteredMenus(baseFiltered);

  isSpinning = true;
  spinBtn.disabled = true;
  document.querySelector('.btn-text').textContent = '결과 뽑는 중...';
  
  // Haptic Feedback for mobile
  if (navigator.vibrate) navigator.vibrate(50);
  
  const randomIndexInPool = Math.floor(Math.random() * smartPool.length);
  const resultMenu = smartPool[randomIndexInPool];
  currentResultMenu = resultMenu;

  // Render slot
  slotInner.innerHTML = '';
  let slotDisplayItems = [];
  // Ensure the target is deep inside the list
  for(let i=0; i<30; i++) {
    slotDisplayItems.push(baseFiltered[Math.floor(Math.random() * baseFiltered.length)]);
  }
  // Plant the result at the end
  slotDisplayItems[28] = resultMenu;

  slotDisplayItems.forEach(menu => {
    const div = document.createElement('div');
    div.className = 'slot-item';
    div.innerHTML = `<span class="emoji">${menu.emoji}</span> ${menu.name}`;
    slotInner.appendChild(div);
  });

  const itemHeight = 120;
  const targetIndex = 28;
  const targetOffset = targetIndex * itemHeight;

  slotInner.style.transition = 'transform 3s cubic-bezier(0.1, 0.7, 0.1, 1)';
  slotInner.style.transform = `translateY(-${targetOffset}px)`;
  slotInner.classList.add('spinning');

  // Continual vibration during spin
  let vibInterval = null;
  if(navigator.vibrate) {
    vibInterval = setInterval(() => navigator.vibrate(20), 200);
  }

  setTimeout(() => {
    slotInner.classList.remove('spinning');
    if(vibInterval) clearInterval(vibInterval);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Success vibration
    showResult(resultMenu);
  }, 3100);
}

function showResult(menuObj) {
  finalMenuEl.textContent = menuObj.name;
  resultEmojiEl.textContent = menuObj.emoji;
  
  // Set mood dynamically
  documentRoot.style.setProperty('--mood-color', menuObj.moodColor);
  
  // Reset reaction buttons
  document.getElementById('like-btn').classList.remove('active');
  document.getElementById('dislike-btn').classList.remove('active');
  if(isFavorite(menuObj.name)) {
    document.getElementById('favorite-btn').classList.add('active');
  } else {
    document.getElementById('favorite-btn').classList.remove('active');
  }

  resultModal.classList.remove('hidden');
  isSpinning = false;
  spinBtn.disabled = false;
  document.querySelector('.btn-text').textContent = '다시 추천받기!';

  // Fetch nearby restaurants automatically via api.js
  fetchNearbyRestaurants(menuObj.name);
}

//=========================================
// 3. EVENT LISTENERS
//=========================================

// Tabs Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const mode = e.target.id.replace('mode-', '');
    currentMode = mode;
    
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');

    document.querySelectorAll('.view-container').forEach(v => v.classList.add('hidden-view'));
    document.getElementById(`${mode}-view`).classList.remove('hidden-view');

    if (mode === 'random') {
      initSlot(currentCategory);
      document.getElementById('slot-machine-area').style.display = 'block';
      spinBtn.style.display = 'flex';
    } else if (mode === 'mix') {
      slotInner.innerHTML = '<div class="slot-item">조합을 선택하세요</div>';
      document.getElementById('slot-machine-area').style.display = 'block';
      spinBtn.style.display = 'flex';
    } else if (mode === 'favorites') {
      document.getElementById('slot-machine-area').style.display = 'none';
      spinBtn.style.display = 'none';
      renderFavorites();
    }
  });
});

// Category & Mix selections
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    if (isSpinning) return;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentCategory = e.target.dataset.category;
    initSlot(currentCategory);
  });
});

document.querySelectorAll('.ing-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.ing-btn').forEach(b => b.classList.remove('selected'));
    e.target.classList.add('selected');
    selectedIngredient = e.target.dataset.ing;
  });
});

document.querySelectorAll('.method-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('selected'));
    e.target.classList.add('selected');
    selectedMethod = e.target.dataset.method;
  });
});

spinBtn.addEventListener('click', spin);

// Modal Controls
document.getElementById('retry-btn').addEventListener('click', () => {
  resultModal.classList.add('hidden');
  documentRoot.style.setProperty('--mood-color', 'transparent');
  document.getElementById('nearby-restaurants').innerHTML = ''; // Reset list
  if(currentMode === 'random') initSlot(currentCategory);
});

// Share Action
document.getElementById('share-btn').addEventListener('click', () => {
  shareResultImage(currentResultMenu);
});

// Reactions
document.getElementById('like-btn').addEventListener('click', (e) => {
  const btn = e.currentTarget;
  if(btn.classList.contains('active')) return;
  btn.classList.add('active');
  document.getElementById('dislike-btn').classList.remove('active');
  updateWeight(currentResultMenu.name, 0.5);
  showToast('취향을 반영했습니다. 👍');
});

document.getElementById('dislike-btn').addEventListener('click', (e) => {
  const btn = e.currentTarget;
  if(btn.classList.contains('active')) return;
  btn.classList.add('active');
  document.getElementById('like-btn').classList.remove('active');
  updateWeight(currentResultMenu.name, -0.5);
  showToast('이 메뉴는 앞으로 덜 추천할게요. 👎');
});

document.getElementById('favorite-btn').addEventListener('click', (e) => {
  const isAdded = toggleFavorite(currentResultMenu, renderFavorites);
  if(isAdded) e.currentTarget.classList.add('active');
  else e.currentTarget.classList.remove('active');
});

document.getElementById('clear-favorites-btn').addEventListener('click', () => {
  if(confirm('보관함을 모두 비울까요?')) {
    clearFavorites(renderFavorites);
  }
});

//=========================================
// 4. BOOTSTRAP
//=========================================
fetchWeather();
initSlot('all');

// PWA Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.log('SW reg failed', err));
  });
}
