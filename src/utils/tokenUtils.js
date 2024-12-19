const TOKEN_KEY = 'volt_auth_token';
const REFRESH_TOKEN_KEY = 'volt_refresh_token';
const USER_KEY = 'volt_user';
const CART_KEY = 'volt_cart';
const THEME_KEY = 'volt_theme';
const LANGUAGE_KEY = 'volt_lang';

export const tokenUtils = {
  // Token Management
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // User Data Management
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  removeUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  // Cart Management
  setCart: (cart) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  },

  getCart: () => {
    const cart = localStorage.getItem(CART_KEY);
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
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  removeRefreshToken: () => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // Clear All Data
  clearAll: () => {
    localStorage.clear();
  }
}; 