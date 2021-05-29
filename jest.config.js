module.exports = {
  verbose: true,
  preset: 'ts-jest',
  rootDir: __dirname,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // transform: {
  //   '^.+\\.vue$': 'vue-jest',
  //   '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
  //   '^.+\\.jsx?$': 'babel-jest'
  // },
  transformIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    // '^wsUtil$': '<rootDir>/node_modules/@tencent/weishi-lib',
    // '\\.(s?css|less)$': 'identity-obj-proxy',
    // '^@/(.*)$': '<rootDir>/src/$1'
  },
  snapshotSerializers: [
    // 'jest-serializer-vue'
  ],
  testMatch: ['**/(test|tests|__test__|__tests__)/**/*.(spec|test).(js|jsx|ts|tsx)'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/.*(.mock.(js|ts))$'],
  testURL: 'http://localhost/',
  collectCoverage: false,
  collectCoverageFrom: ['<rootDir>/packages/*/src/**/*.ts', , '!<rootDir>/src/**/*.mock.(js | ts)'],
  coverageDirectory: '<rootDir>/coverage/',
  coverageReporters: ['html', 'lcov', 'json', 'text-summary', 'clover'],
  reporters: [
    'default',
    // 'jest-html-reporters'
  ],
  setupFiles: [
    '<rootDir>/jest.init.js',
    // 'jest-canvas-mock'
  ],
  // testEnvironment: 'jsdom',
};
