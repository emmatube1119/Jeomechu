//=========================================
// 1. CONFIG
//=========================================
// 카카오 디벨로퍼스(https://developers.kakao.com)에서 발급받은 REST API 키(무료)를 입력하세요.
export const KAKAO_REST_API_KEY = ''; 

//=========================================
// 2. DATA (메뉴 DB + 메타데이터)
//=========================================
export const MENUS = [
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
