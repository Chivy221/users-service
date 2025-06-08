module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageThreshold: {
    global: { branches: 60, functions: 60, lines: 60, statements: 60 }
  }
};
