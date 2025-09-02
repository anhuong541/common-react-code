/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
const config = {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  arrowParens: 'avoid',
  singleAttributePerLine: true,
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  useTabs: false,
  importOrder: ['^react$', '^[a-z]', '^@(?!/)', '^@/', '^[./]'],
}

export default config
