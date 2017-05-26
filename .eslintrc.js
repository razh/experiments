module.exports = {
  extends: 'eslint:recommended',
  env: {
    es6: true,
    browser: true,
  },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': ['error', { before: false, after: true }],
    indent: ['error', 2, { SwitchCase: 1 }],
    'no-console': 'off',
    'object-curly-spacing': ['error', 'always'],
    semi: ['error', 'always'],
    quotes: ['error', 'single', 'avoid-escape'],
  },
};
