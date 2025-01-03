module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^../src/components/(.*)$': '<rootDir>/src/components/__mocks__/$1',
    '^../src/services/(.*)$': '<rootDir>/src/services/__mocks__/$1'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@babel/runtime|whatwg-fetch|axios)/)'
  ],
  testMatch: [
    '<rootDir>/test/**/*.test.js'
  ],
  globals: {
    'jest': true,
    'import.meta': {
      env: {
        VITE_API_URL: 'http://localhost:5000/api'
      }
    }
  },
  setupFiles: ['whatwg-fetch'],
  testEnvironmentOptions: {
    consoleFilter: {
      filterWarnings: true
    }
  }
}; 