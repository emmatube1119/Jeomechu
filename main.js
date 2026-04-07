// main.js - 중앙 제어기 (Controller)
// 모든 모듈을 조립하고 페이지 이벤트를 연결합니다.

console.group('🚀 저메추 앱 부팅');
console.log('1. 모듈 로드 중...');

import { MENUS } from './src/data.js';
import { updateWeight, isFavorite, toggleFavorite, clearFavorites } from './src/store.js';
import { fetchWeather, getSmartFilteredMenus, fetchNearbyRestaurants, generateRecommendationReason } from './src/api.js';
import { showToast, shareResultImage, renderFavorites, updateResultModal } from './src/ui.js';

//=========================================
// 1. STATE & DOM ELEMENTS
//=========================================
let currentMode = 'random'; 
let currentCategory = 'all';
let selectedIngredient = '';
let selectedMethod = '';
let isSpinning = false;
let currentResultMenu = null;

// DOM 캐싱 (함수 밖에서 한 번만 실행)
const slotInner = document.getElementById('slot-inner');
const spinBtn = document.getElementById('spin-btn');
const resultModal = document.getElementById('result-modal');
const finalMenuEl = document.getElementById('final-menu');
const resultEmojiEl = document.getElementById('result-emoji');
const documentRoot = document.documentElement;

console.log('2. DOM 요소 연결 완료:', { slotInner, spinBtn, resultModal });

//=========================================
// 2. CORE LOGIC (Slot Machine)
//=========================================
function initSlot(category) {
  try {
    if(!slotInner) {
      console.warn('⚠️ slot-inner 요소를 찾을 수 없어서 100ms 뒤에 다시 시도합니다.');
      setTimeout(() => initSlot(category), 100);
      return;
    }
    
    const filtered = category === 'all' 
      ? MENUS 
      : (category === 'special' ? MENUS.filter(m => m.isSpecial) : MENUS.filter(m => m.category.includes(category)));
    
    if(filtered.length === 0) return;

    slotInner.innerHTML = '';
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
    console.log(`✅ 슬롯 동기화 완료: [${category}] - 아이템 ${filtered.length}개`);
  } catch (error) {
    console.error('❌ 슬롯 초기화 실패:', error);
  }
}

function spin() {
  if (isSpinning) return;
  console.log('🎲 추천 룰렛 회전 시작!');
  
  let baseFiltered = [];
  if (currentMode === 'random') {
    baseFiltered = currentCategory === 'all' 
      ? MENUS 
      : MENUS.filter(m => m.category.includes(currentCategory));
  } else if (currentMode === 'special') {
    baseFiltered = MENUS.filter(m => m.isSpecial);
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

  const smartPool = getSmartFilteredMenus(baseFiltered);
  isSpinning = true;
  spinBtn.disabled = true;
  const btnText = spinBtn.querySelector('.btn-text');
  if(btnText) btnText.textContent = '결과 뽑는 중...';
  
  if (navigator.vibrate) navigator.vibrate(50);
  
  const randomIndexInPool = Math.floor(Math.random() * smartPool.length);
  const resultMenu = smartPool[randomIndexInPool];
  currentResultMenu = resultMenu;

  slotInner.innerHTML = '';
  let slotDisplayItems = [];
  for(let i=0; i<30; i++) {
    slotDisplayItems.push(baseFiltered[Math.floor(Math.random() * baseFiltered.length)]);
  }
  slotDisplayItems[28] = resultMenu;

  slotDisplayItems.forEach(menu => {
    const div = document.createElement('div');
    div.className = 'slot-item';
    div.innerHTML = `<span class="emoji">${menu.emoji}</span> ${menu.name}`;
    slotInner.appendChild(div);
  });

  const itemHeight = 120;
  const targetOffset = 28 * itemHeight;

  slotInner.style.transition = 'transform 3s cubic-bezier(0.1, 0.7, 0.1, 1)';
  slotInner.style.transform = `translateY(-${targetOffset}px)`;
  slotInner.classList.add('spinning');

  let vibInterval = null;
  if(navigator.vibrate) {
    vibInterval = setInterval(() => navigator.vibrate(20), 200);
  }

  setTimeout(() => {
    slotInner.classList.remove('spinning');
    if(vibInterval) clearInterval(vibInterval);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    showResult(resultMenu);
  }, 3100);
}

function showResult(menuObj) {
  if(!finalMenuEl || !resultEmojiEl || !resultModal) {
    console.error('❌ 결과창 DOM 요소를 찾을 수 없습니다.');
    return;
  }

  const reason = generateRecommendationReason(menuObj);
  updateResultModal(menuObj, reason);

  resultModal.classList.remove('hidden');
  isSpinning = false;
  spinBtn.disabled = false;
  const btnText = spinBtn.querySelector('.btn-text');
  if(btnText) btnText.textContent = '다시 추천받기!';

  fetchNearbyRestaurants(menuObj.name);
  console.log('🎯 결과 발표 완료:', menuObj.name, `(사유: ${reason})`);
}

//=========================================
// 3. EVENT LISTENERS
//=========================================
function setupEventListeners() {
  console.log('3. 이벤트 리스너 연결 중...');

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mode = e.target.id.replace('mode-', '');
      currentMode = mode;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      document.querySelectorAll('.view-container').forEach(v => v.classList.add('hidden-view'));
      const view = document.getElementById(`${mode}-view`);
      if(view) view.classList.remove('hidden-view');

      const slotArea = document.getElementById('slot-machine-area');
      if (mode === 'random' || mode === 'special') {
        initSlot(mode === 'special' ? 'special' : currentCategory);
        if(slotArea) slotArea.style.display = 'block';
        spinBtn.style.display = 'flex';
      } else if (mode === 'mix') {
        if(slotInner) slotInner.innerHTML = '<div class="slot-item">재료를 조합해보세요!</div>';
        if(slotArea) slotArea.style.display = 'block';
        spinBtn.style.display = 'flex';
      } else if (mode === 'favorites') {
        if(slotArea) slotArea.style.display = 'none';
        spinBtn.style.display = 'none';
        renderFavorites();
      }
    });
  });

  // Categorires
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (isSpinning) return;
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.dataset.category;
      initSlot(currentCategory);
    });
  });

  // Mix
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

  if(spinBtn) spinBtn.addEventListener('click', spin);

  // Modal Controls
  const retryBtn = document.getElementById('retry-btn');
  if(retryBtn) {
    retryBtn.addEventListener('click', () => {
      resultModal.classList.add('hidden');
      documentRoot.style.setProperty('--mood-color', 'transparent');
      const nearbyList = document.getElementById('nearby-restaurants');
      if(nearbyList) nearbyList.innerHTML = '';
      if(currentMode === 'random') initSlot(currentCategory);
    });
  }

  // Share
  const shareBtn = document.getElementById('share-btn');
  if(shareBtn) {
    shareBtn.addEventListener('click', () => {
        console.log('📸 공유하기 클릭');
        shareResultImage(currentResultMenu);
    });
  }

  // Reactions
  const likeBtn = document.getElementById('like-btn');
  const dislikeBtn = document.getElementById('dislike-btn');
  const favBtn = document.getElementById('favorite-btn');

  if(likeBtn) {
    likeBtn.addEventListener('click', (e) => {
      if(e.currentTarget.classList.contains('active')) return;
      e.currentTarget.classList.add('active');
      if(dislikeBtn) dislikeBtn.classList.remove('active');
      updateWeight(currentResultMenu.name, 0.5);
      showToast('취향을 반영했습니다. 👍');
    });
  }

  if(dislikeBtn) {
    dislikeBtn.addEventListener('click', (e) => {
      if(e.currentTarget.classList.contains('active')) return;
      e.currentTarget.classList.add('active');
      if(likeBtn) likeBtn.classList.remove('active');
      updateWeight(currentResultMenu.name, -0.5);
      showToast('이 메뉴는 앞으로 덜 추천할게요. 👎');
    });
  }

  if(favBtn) {
    favBtn.addEventListener('click', (e) => {
      if(!currentResultMenu) return;
      const added = toggleFavorite(currentResultMenu);
      if(added) {
        e.currentTarget.classList.add('active');
        showToast('보관함에 저장되었습니다 ⭐');
      } else {
        e.currentTarget.classList.remove('active');
        showToast('보관함에서 제거되었습니다.');
      }
      renderFavorites();
    });
  }

  const clearFavBtn = document.getElementById('clear-favorites-btn');
  if(clearFavBtn) {
    clearFavBtn.addEventListener('click', () => {
      if(confirm('보관함을 모두 비울까요?')) {
        clearFavorites();
        renderFavorites();
        showToast('보관함이 비워졌습니다.');
      }
    });
  }
}

//=========================================
// 4. BOOTSTRAP (앱 시작)
//=========================================
function startApp() {
  console.log('4. 앱 부트스트랩 시작...');
  try {
    setupEventListeners();
    fetchWeather().catch(e => console.warn('날씨 정보를 불러오지 못했습니다.'));
    initSlot('all');
    console.log('🎉 [저메추] 앱이 성공적으로 시작되었습니다!');
    console.groupEnd();
  } catch (error) {
    console.error('💥 앱 초기화 실패:', error);
    console.groupEnd();
  }
}

// DOM이 이미 파싱된 상태인지 확인 후 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

// PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .catch(err => console.warn('PWA 기동 지연 중...'));
  });
}
