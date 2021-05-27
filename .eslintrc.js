module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {},
  ignorePatterns: ['dist/'],
  parser: '@typescript-eslint/parser',
  // parserOptions: {
  //   project: './tsconfig.json',
  // },
  plugins: ['@typescript-eslint'],
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};