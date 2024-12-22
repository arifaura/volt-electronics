const TOKEN_KEY = 'volt_auth_token';
const REFRESH_TOKEN_KEY = 'volt_refresh_token';
const USER_KEY = 'volt_user';
const CART_KEY = 'volt_cart';
const THEME_KEY = 'volt_theme';
const LANGUAGE_KEY = 'volt_lang';
const TOKEN_EXPIRY = 3600000; // 1 hour in milliseconds

const setWithExpiry = (key, value) => {
  const item = {
    value,
    expiry: new Date().getTime() + TOKEN_EXPIRY
  };
  sessionStorage.setItem(key, JSON.stringify(item));
};

const getWithExpiry = (key) => {
  const itemStr = sessionStorage.getItem(key);
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date().getTime();

  if (now > item.expiry) {
    sessionStorage.removeItem(key);
    return null;
  }
  return item.value;
};

export const tokenUtils = {
  // Token Management
  setToken: (token) => {
    setWithExpiry(TOKEN_KEY, token);
  },

  getToken: () => {
    return getWithExpiry(TOKEN_KEY);
  },

  removeToken: () => {
    sessionStorage.removeItem(TOKEN_KEY);
  },

  // User Data Management
  setUser: (user) => {
    setWithExpiry(USER_KEY, user);
  },

  getUser: () => {
    return getWithExpiry(USER_KEY);
  },

  removeUser: () => {
    sessionStorage.removeItem(USER_KEY);
  },

  // Cart Management
  setCart: (cart) => {
    sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
  },

  getCart: () => {
    const cart = sessionStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  },

  // Theme Preference
  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme);
  },

  getTheme: () => {
    return localStorage.getItem(THEME_KEY) || 'light';
  },

  // Language Preference
  setLanguage: (lang) => {
    localStorage.setItem(LANGUAGE_KEY, lang);
  },

  getLanguage: () => {
    return localStorage.getItem(LANGUAGE_KEY) || 'en';
  },

  // Refresh Token Management
  setRefreshToken: (token) => {
    setWithExpiry(REFRESH_TOKEN_KEY, token);
  },

  getRefreshToken: () => {
    return getWithExpiry(REFRESH_TOKEN_KEY);
  },

  removeRefreshToken: () => {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // Check if token is expired
  isTokenExpired: () => {
    const token = getWithExpiry(TOKEN_KEY);
    return !token;
  },

  // Clear All Data
  clearAll: () => {
    sessionStorage.clear();
    // Keep theme and language preferences in localStorage
    const theme = localStorage.getItem(THEME_KEY);
    const lang = localStorage.getItem(LANGUAGE_KEY);
    localStorage.clear();
    if (theme) localStorage.setItem(THEME_KEY, theme);
    if (lang) localStorage.setItem(LANGUAGE_KEY, lang);
  }
}; 