module.exports = {
  printWidth: 100,
  parser: 'typescript',
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'avoid',
  endOfLine: 'auto',
  tabWidth: 2,
  useTabs: false,
  rules: {
    'prettier/prettier': 0,
    '@typescript-eslint/explicit-function-return-type': 'off',
    'no-console': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-implicit-any-catch': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off',
    'simple-import-sort/imports': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-native/no-inline-styles': 'off',
  },
}

