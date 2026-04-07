// src/ui.js
// 시각 요소 전담: 토스트, 렌더링, 공유 버튼 로직을 담당합니다.
import { getFavorites, toggleFavorite } from './store.js';

// Custom Toast
export function showToast(msg) {
  try {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  } catch (e) {
    console.error('Toast Error:', e);
  }
}

// Favorites rendering
export function renderFavorites() {
  const listEl = document.getElementById('favorites-list');
  const favs = getFavorites();
  const clearBtn = document.getElementById('clear-favorites-btn');

  if(!listEl) return;

  if(favs.length === 0) {
    listEl.innerHTML = '<p class="empty-msg">⭐ 아직 보관된 메뉴가 없어요.<br>추천 결과에서 별표를 눌러 저장하세요!</p>';
    if(clearBtn) clearBtn.style.display = 'none';
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
      const menuName = e.target.dataset.name;
      toggleFavorite({name: menuName});
      showToast('보관함에서 제거되었습니다.');
      renderFavorites();
    });
  });

  if(clearBtn) clearBtn.style.display = 'block';
}

export function generateRestaurantHtml(name, rating, distanceMeters, kakaoUrl) {
  const distText = distanceMeters > 1000 ? (distanceMeters/1000).toFixed(1) + 'km' : distanceMeters + 'm';
  const naverUrl = `https://map.naver.com/v5/search/${encodeURIComponent(name)}`;
  
  return `
    <div class="restaurant-card">
      <div class="rest-info">
        <div class="rest-name">${name}</div>
        <div class="rest-dist">📍 도보 ${distText} 거리</div>
      </div>
      <div class="rest-actions">
        <a href="${kakaoUrl}" target="_blank" class="rest-btn kakao-btn">💬 카카오</a>
        <a href="${naverUrl}" target="_blank" class="rest-btn naver-btn">🟢 네이버</a>
      </div>
    </div>
  `;
}

// Share (Canvas) UI logic
export async function shareResultImage(currentResultMenu) {
  if(!currentResultMenu) return;
  
  try {
    const canvas = document.getElementById('share-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Draw bg
    ctx.fillStyle = '#0a0b1e';
    ctx.fillRect(0, 0, 600, 400);
    
    // Draw gradient
    const grad = ctx.createRadialGradient(300, 200, 50, 300, 200, 300);
    grad.addColorStop(0, currentResultMenu.moodColor || '#f39c12');
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
      // Check for Web Share API
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
    console.error('Share Error:', e);
    showToast('공유하기에 실패했습니다.');
  }
}
