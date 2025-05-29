import tsParser from '@typescript-eslint/parser'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

const ignoredSuffix = [
  '.js',
  '.mjs',
  '.stories.tsx',
  '.md',
  '.mdx',
  '.json',
  '.yml',
  '.yaml',
  '.css',
  '.scss',
  '.less',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.otf',
  '.mp4',
  '.webm',
  '.mp3',
  '.wav',
  '.flac',
  '.aac',
  '.ogg',
  '.m4a',
  '.mov',
  '.avi',
  '.zip',
  '.tar',
  '.gz',
  '.tgz',
  '.rar',
  '.7z',
  '.exe',
  '.dll',
  '.so',
  '.dylib',
  '.psd',
  '.ai',
  '.eps',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.log',
  '.csv',
]

/**
 * @type {import('@eslint/eslintrc').FlatCompat[]} eslint.config.mjs
 */
export default [
  {
    ignores: [
      ...ignoredSuffix.map((suffix) => `**/*${suffix}`),
      '**/.next/',
      '**/.local/',
      '**/.vscode/',
      '**/.husky/',
      '**/out/',
      '**/public/',
      '**/node_modules/',
      'src/generated-prisma-client',
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
      'no-unused-vars': 'off',
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
      'no-plusplus': ['warn', { allowForLoopAfterthoughts: true }],
      curly: ['error', 'all'],
    },
  },
]
