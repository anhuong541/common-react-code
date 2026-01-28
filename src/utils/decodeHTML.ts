import he from 'he'
import IntlMessageFormat from 'intl-messageformat'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Values = Record<string, any>

export const decodeHtml = (value?: string | null) => he.decode(value ?? '')

const VAR_REGEX = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g

export function hasTemplateVar(text: string): boolean {
  return VAR_REGEX.test(text)
}

export function replaceTemplateVars(
  text: string,
  values: Record<string, string>,
) {
  return text.replace(VAR_REGEX, (_, key) =>
    key in values ? String(values[key]) : '',
  )
}

// Check if the string has pattern {xxx} or not
export function hasVariable(text: string): boolean {
  return /\{(?!\s*\})([a-zA-Z_][a-zA-Z0-9_]*)\}/.test(text)
}

export function hasHtmlTag(text: string): boolean {
  return /<[^>]+>/.test(text)
}

export function hasICUSyntax(text: string): boolean {
  return /\{[^}]+,\s*(plural|select|number|date|time)/.test(text)
}

export function formatHtmlWithIntl(
  html: string,
  locale: string,
  values: Values,
): string {
  // Split HTML tag và text node
  const parts = html.split(/(<[^>]+>)/g)

  return parts
    .map((part) => {
      // 2. If this is a HTML tag, only replace the variable
      if (part.startsWith('<') && part.endsWith('>')) {
        return replaceTemplateVars(part, values)
      }

      // 3. If this is a text without variable, return it directly
      if (!hasTemplateVar(part)) {
        return part
      }

      // 4. If this is a text with variable and using ICU syntax, use IntlMessageFormat
      if (hasICUSyntax(part)) {
        try {
          const msg = new IntlMessageFormat(part, locale)
          return msg.format(values) as string
          // Simple replace
        } catch (e) {
          console.error('IntlMessageFormat error:', e)
          // fallback: replace manually
          return replaceTemplateVars(part, values)
        }
      }
      return replaceTemplateVars(part, values)
    })
    .join('')
}
