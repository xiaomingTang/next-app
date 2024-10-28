module.exports = {
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'airbnb-typescript/base',
    'plugin:deprecation/recommended',
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
    'deprecation/deprecation': 'warn',
    'no-console': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    // tsc 会检查, 无需 lint
    'no-dupe-class-members': 'off',
    'no-param-reassign': 'off',
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
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allowSingleOrDouble',
      },
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    'no-void': ['error', { allowAsStatement: true }],
  },
}
