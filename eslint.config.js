import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  // Main config for source files
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Downgrade to warnings - many files pending refactor/removal
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow unused vars that start with underscore
      'no-unused-vars': 'off',
      // Allow lexical declarations in case blocks (common pattern)
      'no-case-declarations': 'off',
      // Allow exporting components alongside hooks/utilities (common React pattern)
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Downgrade non-null assertion on optional chain to warning
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
    },
  },
  // Disable react-hooks for e2e tests (Playwright's 'use' is not a React hook)
  {
    files: ['e2e/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
  // Relaxed rules for scripts
  {
    files: ['scripts/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
])
