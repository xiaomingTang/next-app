import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  {
    ignores: [
      '**/*.js',
      '**/*.mjs',
      '**/*.stories.tsx',
      '**/*.md',
      '**/*.mdx',
      '**/.next/',
      '**/.local/',
      '**/out/',
      '**/public/',
      '**/node_modules/',
    ],
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
    'prettier'
  ),
  {
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        project: './tsconfig.json',
      },
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
      // 'deprecation/deprecation': 'warn',
      'no-console': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      // tsc 会检查, 无需 lint
      'no-dupe-class-members': 'off',
      'no-param-reassign': 'off',
      'import/prefer-default-export': 'off',

      '@typescript-eslint/no-empty-object-type': 'off',

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
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
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

      'no-void': [
        'error',
        {
          allowAsStatement: true,
        },
      ],
    },
  },
]
