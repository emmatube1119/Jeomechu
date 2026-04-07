import { KAKAO_REST_API_KEY } from './data.js';
import { generateRestaurantHtml, showToast } from './ui.js';
import { getWeight } from './store.js';

export let userWeather = null;

// Weather logic
export async function fetchWeather() {
  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current_weather=true', {
        mode: 'cors'
    });
    const data = await res.json();
    const weathercode = data.current_weather.weathercode;
    const temp = data.current_weather.temperature;
    
    let condition = 'Clear';
    if ([51,53,55,61,63,65,80,81,82].includes(weathercode)) condition = 'Rain';
    else if ([71,73,75,85,86].includes(weathercode)) condition = 'Snow';

    userWeather = { condition, temp };
    console.log('🛰️ 날씨 정보 로드 완료:', userWeather);

    const statusEl = document.getElementById('weather-status');
    if(statusEl) {
        statusEl.textContent = `현재 기온: ${temp}°C, ${condition === 'Rain' ? '비오는 날엔 파전이나 국물 추천!' : '오늘 저녁 메뉴, 고민 끝!'}`;
    }
  } catch (err) {
    console.warn('⚠️ 날씨 정보 로드 실패 (CORS 또는 네트워크):', err);
    userWeather = { condition: 'Clear', temp: 20 }; // fallback
  }
}

// 명칭: 추천 사유 생성기
export function generateRecommendationReason(menu) {
  const hour = new Date().getHours();
  const isNight = hour >= 21 || hour < 4;
  const userWeight = getWeight(menu.name);

  // 1. 특별한 날 메뉴인 경우
  if (menu.isSpecial) return "✨ 특별한 날에 어울리는 고급스러운 메뉴예요!";

  // 2. 날씨 기반
  if (userWeather) {
    if (userWeather.condition === 'Rain' && (menu.name.includes('짬뽕') || menu.method === 'stew')) {
        return "🌧️ 비 오는 날엔 역시 뜨끈한 국물이 최고죠!";
    }
    if (userWeather.temp > 28 && menu.mood === 'fresh') {
        return "☀️ 오늘처럼 더운 날에는 시원한 메뉴가 정답이에요!";
    }
    if (userWeather.temp < 5 && menu.method === 'stew') {
        return "❄️ 추운 날씨를 녹여줄 따뜻한 국물을 추천드려요!";
    }
  }

  // 3. 시간 기반
  if (isNight && menu.category.includes('night')) {
    return "🌙 야식이 생각나는 이 시간, 부담 없이(어쩌면 조금 부담 있게?) 즐겨보세요!";
  }

  // 4. 취향 기반
  if (userWeight > 1.0) {
    return "❤️ 평소에 자주 찾으시는 사용자님의 취향 저격 메뉴입니다!";
  }

  // 기본 문구
  return "😋 오늘 저녁, 이 메뉴는 어떠신가요? 탁월한 선택이 될 거예요!";
}

// Calculate smart weights based on weather, time, and user history
export function getSmartFilteredMenus(baseFiltered) {
  const hour = new Date().getHours();
  const isNight = hour >= 21 || hour < 4;

  let weightedList = [];

  baseFiltered.forEach(m => {
    let weight = getWeight(m.name); // user history base

    // Time logic
    if (isNight && m.category.includes('night')) weight *= 2.2;

    // Weather logic
    if (userWeather) {
      if (userWeather.condition === 'Rain' && (m.name.includes('짬뽕') || m.method === 'stew')) weight *= 1.8;
      if (userWeather.temp > 28 && m.mood === 'fresh') weight *= 1.8; 
      if (userWeather.temp < 5 && m.method === 'stew') weight *= 1.8;
    }

    const tickets = Math.max(1, Math.round(weight * 10));
    for (let i = 0; i < tickets; i++) {
        weightedList.push(m);
    }
  });

  return weightedList.length > 0 ? weightedList : baseFiltered;
}

// Kakao Local API
export async function fetchNearbyRestaurants(menuName) {
  const listContainer = document.getElementById('nearby-restaurants');
  if(!listContainer) return;
  listContainer.classList.remove('hidden');
  listContainer.innerHTML = '<div class="loading-spinner">🗺️ 주변 맛집 찾는 중...</div>';

  if (!navigator.geolocation) {
    listContainer.innerHTML = '<div class="error-msg">위치 정보를 지원하지 않는 브라우저입니다.</div>';
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    if (!KAKAO_REST_API_KEY) {
      setTimeout(() => {
        listContainer.innerHTML = `
          <div class="api-notice">⚠️ 카카오 API 키를 입력하면 진짜 맛집이 나옵니다! (현재는 예시)</div>
          ${generateRestaurantHtml('원조 꿀맛 ' + menuName, 4.5, 300, '#')}
          ${generateRestaurantHtml('할머니 전통 ' + menuName, 4.2, 850, '#')}
          ${generateRestaurantHtml('핫플 ' + menuName + ' 전문점', 4.8, 1200, '#')}
        `;
      }, 1000);
      return;
    }

    try {
      const query = encodeURIComponent(menuName + ' 맛집');
      const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${query}&x=${lng}&y=${lat}&radius=3000&size=5`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`
        }
      });
      
      if (!response.ok) throw new Error('API 호출 실패');
      
      const data = await response.json();
      const places = data.documents;

      if (places.length === 0) {
        listContainer.innerHTML = '<div class="empty-msg">근처에 해당하는 맛집이 없네요 😢</div>';
        return;
      }

      listContainer.innerHTML = places.map(p => 
        generateRestaurantHtml(p.place_name, '', Math.round(Number(p.distance)), p.place_url)
      ).join('');

    } catch (err) {
      listContainer.innerHTML = '<div class="error-msg">맛집을 불러오는데 실패했습니다. (API 키 확인 필요)</div>';
      console.error(err);
    }
  }, (err) => {
    listContainer.innerHTML = '<div class="error-msg">위치 정보 액세스가 허용되지 않았습니다 📍</div>';
  });
}
