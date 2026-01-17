module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**',
  ],
  testMatch: [
    '**/tests/**/*.test.js',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/integration/',
  ],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
