import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname
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
          ignoreRestSiblings: true // Ignore rest siblings when destructuring (e.g., `const { a, ...rest } = obj`)
        }
      ],

      // Enforce a specific import order
      'import/order': [
        1, // Warning level (can be changed to 'error' if desired)
        {
          groups: [
            'builtin', // Node.js built-ins (fs, path, etc.)
            'external', // External packages (e.g., react, lodash)
            'internal', // Internal modules (e.g., `@/utils`)
            ['sibling', 'parent'], // Relative imports from sibling and parent directories
            'index', // Index file imports (e.g., './')
            'object', // Object imports (rare use case)
            'type', // Type-only imports (TypeScript)
            'unknown' // Anything not matched by the above
          ],
          pathGroups: [
            {
              pattern: 'react', // Place 'react' imports first in the external group
              group: 'external',
              position: 'before'
            },
            {
              pattern: '@(?!/).*', // Scoped packages not starting with '@/'
              group: 'external',
              position: 'after'
            },
            {
              pattern: '@/*', // Treat `@/` imports as internal
              group: 'internal',
              position: 'before'
            },
            {
              pattern: '@/*', // Also treat `@/` as type imports, but place them after
              group: 'type',
              position: 'after'
            }
          ],
          pathGroupsExcludedImportTypes: ['react', 'next'], // Exclude these types from path group matching
          'newlines-between': 'always', // Always insert a newline between import groups
          alphabetize: {
            order: 'asc', // Sort imports alphabetically
            caseInsensitive: true // Ignore case when sorting
          }
        }
      ]
    }
  })
]

export default eslintConfig
