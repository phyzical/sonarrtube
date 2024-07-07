import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginImport from 'eslint-plugin-import';

const ignorePattern = '^_';

export default [
  eslint.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        console: true,
        describe: true,
        it: true,
        beforeEach: true,
        afterEach: true,
        expect: true,
        Element: true,
        HTMLInputElement: true,
        HTMLFormElement: true,
        module: true,
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'ESNext',
        parser: tseslint.parser,
      },
    },
    plugins: {
      import: { rules: pluginImport.rules },
    },
    rules: {
      'class-methods-use-this': 'off',
      'no-param-reassign': 'off',
      'no-plusplus': 'off',
      'no-await-in-loop': 'off',
      'no-tabs': 'error',
      'no-underscore-dangle': 'off',
      'no-unused-vars': ['error', {
        argsIgnorePattern: ignorePattern, varsIgnorePattern: ignorePattern, caughtErrorsIgnorePattern: ignorePattern
      }],
      'import/extensions': 'off',
      'import/order': ['error', {
        'groups': ['builtin', 'external', 'parent', 'sibling', 'index'],
        'pathGroups': [
          {
            'pattern': '@sonarrTube/**',
            'group': 'parent',
            'position': 'after'
          }
        ],
        'pathGroupsExcludedImportTypes': ['builtin'],
        'newlines-between': 'always'
      }],
      'import/first': 'off',
      'import/no-unresolved': 'off',
      quotes: ['error', 'single'],
      curly: ['error', 'all'],
      'no-restricted-imports': ['error', {
        'patterns': ['./', '../*']
      }],
      'import/prefer-default-export': 'off',
      semi: ['error', 'always'],
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: ignorePattern, varsIgnorePattern: ignorePattern, caughtErrorsIgnorePattern: ignorePattern
      }],
      '@typescript-eslint/semi': ['off'],
      '@typescript-eslint/explicit-function-return-type': ['error'],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
      'prefer-arrow-callback': 'error',
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'arrow-body-style': 'error',
      'max-len': ['error', { code: 120 }],
      'newline-before-return': 'error',
      // "function-call-argument-newline": ["error", "always"],
      'newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
    },
    settings: {},
  },
  {
    ignores: ['.DS_Store', 'node_modules/', 'tmp/', 'coverage/', '.vscode/', '.env*', '!.env*.dist', 'build/'],
  },
];
