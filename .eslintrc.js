module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    'prettier',
    '@typescript-eslint',
  ],
  extends: [
    'airbnb',
    'prettier',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'no-prototype-builtins': 'off',
    'no-await-in-loop': 'off',
    'import/extensions' : 'off',
    'import/no-unresolved': 'off',
    'no-console': 'off',
  },
};
