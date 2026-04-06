import './style.css';

//=========================================
// 1. DATA (메뉴 DB + 메타데이터)
//=========================================
const MENUS = [
  { name: '김치찌개', category: ['korean', 'spicy'], ingredient: 'meat', method: 'stew', emoji: '🥘', mood: 'spicy', moodColor: '#ff4d4d' },
  { name: '불고기', category: ['korean'], ingredient: 'meat', method: 'grill', emoji: '🥩', mood: 'savory', moodColor: '#d35400' },
  { name: '된장찌개', category: ['korean'], ingredient: 'veggie', method: 'stew', emoji: '🍲', mood: 'warm', moodColor: '#e67e22' },
  { name: '비빔밥', category: ['korean', 'light'], ingredient: 'veggie', method: 'mix', emoji: '🥗', mood: 'healthy', moodColor: '#2ecc71' },
  { name: '돈까스', category: ['japanese'], ingredient: 'meat', method: 'fry', emoji: '🍛', mood: 'heavy', moodColor: '#f39c12' },
  { name: '초밥', category: ['japanese', 'light'], ingredient: 'seafood', method: 'raw', emoji: '🍣', mood: 'fresh', moodColor: '#3498db' },
  { name: '라멘', category: ['japanese'], ingredient: 'noodle', method: 'stew', emoji: '🍜', mood: 'warm', moodColor: '#f1c40f' },
  { name: '스테이크', category: ['western'], ingredient: 'meat', method: 'grill', emoji: '🥩', mood: 'fancy', moodColor: '#8e44ad' },
  { name: '파스타', category: ['western'], ingredient: 'noodle', method: 'mix', emoji: '🍝', mood: 'fancy', moodColor: '#e74c3c' },
  { name: '피자', category: ['western'], ingredient: 'dough', method: 'bake', emoji: '🍕', mood: 'party', moodColor: '#f1c40f' },
  { name: '짜장면', category: ['chinese'], ingredient: 'noodle', method: 'mix', emoji: '🟤', mood: 'heavy', moodColor: '#2c3e50' },
  { name: '짬뽕', category: ['chinese', 'spicy'], ingredient: 'noodle', method: 'stew', emoji: '🔥', mood: 'spicy', moodColor: '#e74c3c' },
  { name: '탕수육', category: ['chinese'], ingredient: 'meat', method: 'fry', emoji: '🍖', mood: 'heavy', moodColor: '#f39c12' },
  { name: '마라탕', category: ['chinese', 'spicy'], ingredient: 'mix', method: 'stew', emoji: '🌶️', mood: 'spicy', moodColor: '#c0392b' },
  { name: '치킨', category: ['western', 'night'], ingredient: 'meat', method: 'fry', emoji: '🍗', mood: 'party', moodColor: '#f39c12' },
  { name: '떡볶이', category: ['korean', 'spicy'], ingredient: 'dough', method: 'stew', emoji: '🌶️', mood: 'spicy', moodColor: '#e74c3c' },
  { name: '샐러드', category: ['light'], ingredient: 'veggie', method: 'raw', emoji: '🥗', mood: 'healthy', moodColor: '#2ecc71' },
  { name: '쌀국수', category: ['light'], ingredient: 'noodle', method: 'stew', emoji: '🍜', mood: 'warm', moodColor: '#1abc9c' },
  { name: '순대국', category: ['korean'], ingredient: 'meat', method: 'stew', emoji: '🍲', mood: 'warm', moodColor: '#d35400' },
  { name: '갈비탕', category: ['korean'], ingredient: 'meat', method: 'stew', emoji: '🍖', mood: 'warm', moodColor: '#e67e22' },
  { name: '육개장', category: ['korean', 'spicy'], ingredient: 'meat', method: 'stew', emoji: '🔥', mood: 'spicy', moodColor: '#c0392b' },
  { name: '삼겹살', category: ['korean', 'night'], ingredient: 'meat', method: 'grill', emoji: '🥓', mood: 'party', moodColor: '#d35400' },
  { name: '제육볶음', category: ['korean', 'spicy'], ingredient: 'meat', method: 'fry', emoji: '🥘', mood: 'spicy', moodColor: '#e74c3c' },
  { name: '회', category: ['japanese', 'light'], ingredient: 'seafood', method: 'raw', emoji: '🐟', mood: 'fresh', moodColor: '#3498db' },
  { name: '햄버거', category: ['western'], ingredient: 'meat', method: 'fry', emoji: '🍔', mood: 'casual', moodColor: '#f1c40f' },
  { name: '족발', category: ['korean', 'night'], ingredient: 'meat', method: 'stew', emoji: '🍖', mood: 'party', moodColor: '#8e44ad' }
];

//=========================================
// 2. STATE & UTILS
//=========================================
let currentMode = 'random'; // random, mix, favorites
let currentCategory = 'all';
let selectedIngredient = '';
let selectedMethod = '';
let isSpinning = false;
let currentResultMenu = null;
let userWeather = null; // { condition: 'Rain', temp: 20 }

const STORAGE_FAQS = 'jemechu_favorites';
const STORAGE_WEIGHTS = 'jemechu_weights';

// Custom Toast
function showToast(msg) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// User Action Storage (Like/Dislike)
function updateWeight(menuName, delta) {
  let weights = JSON.parse(localStorage.getItem(STORAGE_WEIGHTS) || '{}');
  weights[menuName] = (weights[menuName] || 1.0) + delta;
  // min threshold
  if (weights[menuName] < 0.1) weights[menuName] = 0.1;
  localStorage.setItem(STORAGE_WEIGHTS, JSON.stringify(weights));
}

function getWeight(menuName) {
  let weights = JSON.parse(localStorage.getItem(STORAGE_WEIGHTS) || '{}');
  return weights[menuName] !== undefined ? weights[menuName] : 1.0;
}

// Favorites Storage
function getFavorites() {
  return JSON.parse(localStorage.getItem(STORAGE_FAQS) || '[]');
}

function toggleFavorite(menuObj) {
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
  renderFavorites();
  return exists === -1; // true if added
}

function isFavorite(menuName) {
  return getFavorites().some(m => m.name === menuName);
}

//=========================================
// 3. API & SMART LOGIC
//=========================================
async function fetchWeather() {
  try {
    // Open-Meteo (No API Key Required) - default Seoul
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current_weather=true');
    const data = await res.json();
    const weathercode = data.current_weather.weathercode;
    const temp = data.current_weather.temperature;
    
    // Simple interpretation 
    let condition = 'Clear';
    if ([51,53,55,61,63,65,80,81,82].includes(weathercode)) condition = 'Rain';
    else if ([71,73,75,85,86].includes(weathercode)) condition = 'Snow';

    userWeather = { condition, temp };
    document.getElementById('weather-status').textContent = `현재 서울: ${temp}°C, ${condition === 'Rain' ? '비오는 날엔 파전/짬뽕!' : '오늘 저녁 메뉴, 고민 끝!'}`;
  } catch (err) {
    console.log('Weather fetch failed', err);
  }
}

// Calculate smart weights based on weather, time, and user history
function getSmartFilteredMenus(baseFiltered) {
  const hour = new Date().getHours();
  const isNight = hour >= 21 || hour < 4;

  let weightedList = [];

  baseFiltered.forEach(m => {
    let weight = getWeight(m.name); // user history base

    // Time logic
    if (isNight && m.category.includes('night')) weight *= 2.0;

    // Weather logic
    if (userWeather) {
      if (userWeather.condition === 'Rain' && (m.name.includes('짬뽕') || m.name.includes('파전') || m.method === 'stew')) {
        weight *= 1.5;
      }
      if (userWeather.temp > 30 && m.mood === 'fresh') weight *= 1.5; // hot day
      if (userWeather.temp < 5 && m.method === 'stew') weight *= 1.5; // cold day
    }

    // Add to pool relative to weight (simulated weighted random)
    const tickets = Math.max(1, Math.round(weight * 10));
    for (let i = 0; i < tickets; i++) {
        weightedList.push(m);
    }
  });

  return weightedList.length > 0 ? weightedList : baseFiltered;
}

//=========================================
// 4. DOM ELEMENTS
//=========================================
const slotInner = document.getElementById('slot-inner');
const spinBtn = document.getElementById('spin-btn');
const resultModal = document.getElementById('result-modal');
const finalMenuEl = document.getElementById('final-menu');
const resultEmojiEl = document.getElementById('result-emoji');
const documentRoot = document.documentElement;

//=========================================
// 5. CORE LOGIC
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

  // Applies weather/time/history weights
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
}

//=========================================
// 6. EVENT LISTENERS & UI LOGIC
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
  btn.addEventListener('click', () => {
    if (isSpinning) return;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    initSlot(currentCategory);
  });
});

document.querySelectorAll('.ing-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ing-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedIngredient = btn.dataset.ing;
  });
});

document.querySelectorAll('.method-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedMethod = btn.dataset.method;
  });
});

spinBtn.addEventListener('click', spin);

// Modal Controls
document.getElementById('retry-btn').addEventListener('click', () => {
  resultModal.classList.add('hidden');
  documentRoot.style.setProperty('--mood-color', 'transparent');
  if(currentMode === 'random') initSlot(currentCategory);
});

// Actions
document.getElementById('map-btn').addEventListener('click', () => {
  if(!currentResultMenu) return;
  const searchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(currentResultMenu.name + ' 맛집')}`;
  window.open(searchUrl, '_blank');
});

// Share (Canvas)
document.getElementById('share-btn').addEventListener('click', async () => {
  if(!currentResultMenu) return;
  
  try {
    const canvas = document.getElementById('share-canvas');
    const ctx = canvas.getContext('2d');
    
    // Draw bg
    ctx.fillStyle = '#0a0b1e';
    ctx.fillRect(0, 0, 600, 400);
    
    // Draw glow
    const grad = ctx.createRadialGradient(300, 200, 50, 300, 200, 300);
    grad.addColorStop(0, currentResultMenu.moodColor);
    grad.addColorStop(1, 'transparent');
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,600,400);
    ctx.globalAlpha = 1.0;

    // Draw text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 30px "Gmarket Sans", sans-serif';
    ctx.fillText("오늘 저녁은...", 300, 100);
    
    ctx.font = 'bold 80px "Gmarket Sans", sans-serif';
    ctx.fillText(currentResultMenu.emoji + ' ' + currentResultMenu.name, 300, 220);
    
    ctx.font = '20px "Gmarket Sans", sans-serif';
    ctx.fillStyle = '#a0a0cc';
    ctx.fillText("저메추(jemechu.app)에서 추천받았어요!", 300, 350);

    canvas.toBlob(async (blob) => {
      // Check if Web Share API applies
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'jemechu.png', {type: 'image/png'})]})) {
        await navigator.share({
          files: [new File([blob], 'jemechu.png', {type: 'image/png'})],
          title: '저메추 추천 결과',
          text: `오늘 저녁은 ${currentResultMenu.name} 어때요?`
        });
      } else {
        // Fallback: Download
        const link = document.createElement('a');
        link.download = '저메추_추천결과.png';
        link.href = URL.createObjectURL(blob);
        link.click();
        showToast('이미지가 저장되었습니다.');
      }
    });
  } catch(e) {
    console.error(e);
    showToast('공유하기에 실패했습니다.');
  }
});

// Reactions
document.getElementById('like-btn').addEventListener('click', (e) => {
  const btn = e.currentTarget;
  if(btn.classList.contains('active')) return;
  btn.classList.add('active');
  document.getElementById('dislike-btn').classList.remove('active');
  updateWeight(currentResultMenu.name, 0.5); // Increase probability
  showToast('추향을 반영했습니다. 👍');
});

document.getElementById('dislike-btn').addEventListener('click', (e) => {
  const btn = e.currentTarget;
  if(btn.classList.contains('active')) return;
  btn.classList.add('active');
  document.getElementById('like-btn').classList.remove('active');
  updateWeight(currentResultMenu.name, -0.5); // Decrease probability
  showToast('이 메뉴는 앞으로 덜 추천할게요. 👎');
});

document.getElementById('favorite-btn').addEventListener('click', (e) => {
  const isAdded = toggleFavorite(currentResultMenu);
  if(isAdded) e.currentTarget.classList.add('active');
  else e.currentTarget.classList.remove('active');
});

// Favorites rendering
function renderFavorites() {
  const listEl = document.getElementById('favorites-list');
  const favs = getFavorites();
  const clearBtn = document.getElementById('clear-favorites-btn');

  if(favs.length === 0) {
    listEl.innerHTML = '<p class="empty-msg">⭐ 아직 보관된 메뉴가 없어요.<br>추천 결과에서 별표를 눌러 저장하세요!</p>';
    clearBtn.style.display = 'none';
    return;
  }

  listEl.innerHTML = '';
  favs.forEach(menu => {
    const div = document.createElement('div');
    div.className = 'fav-item';
    div.innerHTML = `
      <div class="fav-info"><span class="fav-emoji">${menu.emoji}</span> ${menu.name}</div>
      <button class="remove-fav-btn" data-name="${menu.name}">X</button>
    `;
    listEl.appendChild(div);
  });

  document.querySelectorAll('.remove-fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      toggleFavorite({name: e.target.dataset.name});
    });
  });

  clearBtn.style.display = 'block';
}

document.getElementById('clear-favorites-btn').addEventListener('click', () => {
  if(confirm('보관함을 모두 비울까요?')) {
    localStorage.removeItem(STORAGE_FAQS);
    renderFavorites();
  }
});

//=========================================
// 7. BOOTSTRAP
//=========================================
fetchWeather();
initSlot('all');

// PWA Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.log('SW reg failed', err));
  });
}
