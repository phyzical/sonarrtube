import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
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
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module',
      },
    },
    rules: {
      'class-methods-use-this': 'off',
      'no-param-reassign': 'off',
      'no-plusplus': 'off',
      'no-await-in-loop': 'off',
      'no-tabs': 'error',
      'no-underscore-dangle': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'import/extensions': 'off',
      'import/first': 'off',
      'import/no-unresolved': 'off',
      quotes: ['error', 'single'],
      curly: ['error', 'all'],
      'import/prefer-default-export': 'off',
      semi: ['error', 'always'],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
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
