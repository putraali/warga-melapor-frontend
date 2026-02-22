module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx'],
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  collectCoverage: true,
  coverageReporters: ['json', 'lcov', 'text'],
};