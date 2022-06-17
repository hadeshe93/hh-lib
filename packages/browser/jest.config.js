const buildConfig = require('../../jest.base.config');

module.exports = buildConfig(__dirname, {
  // 参考：https://jestjs.io/docs/configuration#testenvironment-string
  testEnvironment: 'jsdom', // 浏览器 app 用 'jsdom'，node 端 app 用 'node'，默认后者
  testEnvironmentOptions: {
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
  },

  setupFiles: [
    '<rootDir>/jest.setup.js',
    // 'jest-canvas-mock'
  ],
});
