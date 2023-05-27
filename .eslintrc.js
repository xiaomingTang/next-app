module.exports = {
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'airbnb-typescript/base',
    'next/core-web-vitals',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.ts', '.tsx'],
      },
      alias: {
        map: [
          ['@', './src'],
          ['@ROOT', '.'],
        ],
      },
    },
  },
  rules: {
    'no-console': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    // tsc 会检查, 无需 lint
    'no-dupe-class-members': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          // un-ban a type that's banned by default
          '{}': false,
        },
        extendDefaults: true,
      },
    ],
    '@typescript-eslint/consistent-type-imports': 'error',
    'no-multiple-empty-lines': 'error',
    'import/order': [
      'warn',
      {
        'newlines-between': 'always',
        groups: [
          'index',
          'sibling',
          'parent',
          'internal',
          'external',
          'builtin',
          'object',
          'type',
        ],
      },
    ],
    'no-underscore-dangle': 'off',
  },
}
