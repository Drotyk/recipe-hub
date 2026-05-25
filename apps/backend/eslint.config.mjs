import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import eslintComments from 'eslint-plugin-eslint-comments';
import importPlugin from 'eslint-plugin-import';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'temp/**',
      'pgadmin-data/**',
      'postgres-data/**',
      '.init/**',
      'init/**',
      'readme-files/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'eslint-comments': eslintComments,
      import: importPlugin,
      unicorn,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...eslintComments.configs.recommended.rules,
      semi: 0,
      curly: [2, 'multi-line'],
      indent: 0,
      quotes: [2, 'single'],
      'padding-line-between-statements': [
        2,
        {
          blankLine: 'always',
          prev: ['const', 'let', 'var', 'directive', 'if'],
          next: '*',
        },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var', 'directive'],
          next: ['const', 'let', 'var', 'directive'],
        },
        {
          blankLine: 'always',
          prev: '*',
          next: ['if'],
        },
        {
          blankLine: 'never',
          prev: ['if'],
          next: ['if'],
        },
      ],
      'no-trailing-spaces': 1,
      'no-multi-spaces': 2,
      'eol-last': [2, 'always'],
      'arrow-parens': [2, 'always'],
      'no-multiple-empty-lines': [2, { max: 2, maxEOF: 0, maxBOF: 0 }],
      'quote-props': [2, 'as-needed'],
      'object-curly-spacing': [2, 'always'],
      'comma-dangle': [2, 'always-multiline'],
      'comma-spacing': [2, { before: false, after: true }],
      'lines-between-class-members': 0,
      'space-before-function-paren': 0,
      'no-unused-vars': 0,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { vars: 'all', args: 'none', ignoreRestSiblings: false },
      ],
      '@typescript-eslint/no-empty-interface': 0,
      'import/order': [
        2,
        {
          'newlines-between': 'always',
          pathGroupsExcludedImportTypes: ['@app/**'],
          pathGroups: [
            {
              pattern: '@app/**',
              group: 'external',
              position: 'after',
            },
          ],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/newline-after-import': [2, { count: 2 }],
      'unicorn/import-style': [
        'error',
        {
          styles: {
            util: false,
            path: {
              named: true,
            },
          },
        },
      ],
      'unicorn/no-null': 0,
      'unicorn/no-new-array': 0,
      'unicorn/no-array-callback-reference': 0,
      'unicorn/prefer-module': 0,
      'unicorn/no-array-reduce': 0,
      'unicorn/prefer-node-protocol': 0,
      'unicorn/prevent-abbreviations': 0,
      'unicorn/prefer-top-level-await': 0,
      'unicorn/prefer-ternary': [2, 'only-single-line'],
      'eslint-comments/no-unused-disable': 2,
      '@typescript-eslint/explicit-module-boundary-types': 0,
      '@typescript-eslint/ban-ts-comment': 0,
      'unicorn/numeric-separators-style': 0,
      '@typescript-eslint/no-namespace': 0,
      'unicorn/prefer-type-error': 0,
      'unicorn/no-process-exit': 0,
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'no-type-imports',
          disallowTypeAnnotations: false,
          fixStyle: 'separate-type-imports',
        },
      ],
      'keyword-spacing': [
        'error',
        {
          before: true,
          after: true,
        },
      ],
      'key-spacing': [
        'error',
        {
          beforeColon: false,
          afterColon: true,
          mode: 'strict',
        },
      ],
      'arrow-spacing': [
        'error',
        {
          before: true,
          after: true,
        },
      ],
      'max-len': [
        'error',
        {
          code: 120,
          tabWidth: 2,
          ignoreComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
    },
  },
  {
    files: ['*.e2e-spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 0,
    },
  },
];
