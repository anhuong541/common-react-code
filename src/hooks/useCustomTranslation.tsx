import parse from 'html-react-parser'
import { useLocale, useTranslations as useNextIntlTranslations } from 'next-intl'
import { formatHtmlWithIntl, hasHtmlTag, hasVariable } from '@/utils/decodeHTML'

export interface CustomTranslationOptions {
  isRaw?: boolean
}

export default function useTranslations(namespace?: string) {
  const t = useNextIntlTranslations(namespace)
  const locale = useLocale()

  return (key: string, values?: Record<string, any>, options?: CustomTranslationOptions) => {
    const raw = t.raw(key)

    if (typeof raw !== 'string') {
      return parse(raw)
    }

    // Note: this is a workaround to support the old syntax of the translations
    // You can remove this if you want to use the syntax of the translations from next-intl
    const rawText = raw
      // [[value]] -> {value}
      .replace(/\[\[(\w+)\]\]/g, '{$1}')
      // [value] -> {value}
      .replace(/\[(\w+)\]/g, '{$1}')
      // {{value}} -> {value}
      .replace(/\{\{(\w+)\}\}/g, '{$1}')
      // %s -> {keyword}
      .replace(/%s/g, '{keyword}')

    if (!hasVariable(rawText)) {
      return parse(raw)
    }

    try {
      const formatted = formatHtmlWithIntl(rawText, locale, values ?? {})

      // Check if the formatted string has HTML tags and if the options.isRaw is false, then parse the string
      if (!options?.isRaw && hasHtmlTag(formatted)) {
        return parse(formatted)
      }
      return formatted
    } catch (error) {
      translateLogValues(key, values)
      console.error('error => ', error)
      return parse(raw)
    }
  }
}

function translateLogValues(key: string, values: any) {
  const keyYouWantToLog = 'none_key_for_testing_currently' // TODO: Add the key you want to log
  if (key === keyYouWantToLog) {
    console.log(values)
  }
}
