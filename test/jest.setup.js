const { expect } = require('@jest/globals');
require('@testing-library/jest-dom');
global.fetch = require('whatwg-fetch').fetch;

// Suppress React Router warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('React Router')) {
    return;
  }
  originalWarn(...args);
}; 