/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
const config = {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  singleAttributePerLine: true,
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  useTabs: false,
  importOrder: ['^react$', '^[a-z]', '^@(?!/)', '^@/', '^[./]'],
  trailingComma: 'all',
  printWidth: 80,
  bracketSpacing: true,
  arrowParens: 'always',
}

export default config
