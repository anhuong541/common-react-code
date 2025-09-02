import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...compat.config({
    extends: ['next', 'prettier'], // Use Next.js base rules and disable ESLint rules that conflict with Prettier
    plugins: ['prettier'], // Enable Prettier plugin for code formatting
    rules: {
      // Enforce Prettier formatting as an ESLint error
      'prettier/prettier': ['error'],

      // Report unused variables, but ignore ones prefixed with "_"
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all', // Check all function arguments
          argsIgnorePattern: '^_', // Ignore unused arguments starting with "_"
          caughtErrors: 'all', // Check all caught errors in try-catch blocks
          caughtErrorsIgnorePattern: '^_', // Ignore caught errors starting with "_"
          destructuredArrayIgnorePattern: '^_', // Ignore unused array destructure elements starting with "_"
          varsIgnorePattern: '^_', // Ignore all unused variables starting with "_"
          ignoreRestSiblings: true, // Ignore rest siblings when destructuring (e.g., `const { a, ...rest } = obj`)
        },
      ],
    },
  }),
]

export default eslintConfig
