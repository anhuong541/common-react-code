import { locales, type Locale } from './config'

export function getAlternateLinks(pathname: string) {
  return locales.map((locale) => {
    // Remove the current locale from pathname if it exists
    const cleanPathname = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '')

    return {
      hrefLang: locale,
      href: `/${locale}${cleanPathname}`,
    }
  })
}

export function getCanonicalUrl(
  pathname: string,
  locale: Locale,
  baseUrl: string,
) {
  const cleanPathname = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '')
  return `${baseUrl}/${locale}${cleanPathname}`
}
