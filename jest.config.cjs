module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/server/**/__tests__/**/*.spec.js'],
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/**/__tests__/**',
    '!server/node_modules/**'
  ],
  coverageDirectory: 'coverage/server',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: [],
  verbose: true
};