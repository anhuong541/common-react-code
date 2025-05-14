import i18n, { createInstance, Resource } from 'i18next'
import { initReactI18next } from 'react-i18next/initReactI18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import enTranslation from '@/locales/en'
import viTranslation from '@/locales/vi'

const i18nConfig = {
  locales: ['vi', 'en'],
  defaultLocale: 'vi'
}
async function initTranslations(
  locale: string,
  namespaces: string[],
  i18nInstance?: typeof i18n,
  resources?: Resource
) {
  i18nInstance = i18nInstance || createInstance()

  i18nInstance.use(initReactI18next)

  if (!resources) {
    i18nInstance.use(resourcesToBackend((language: string) => import(`@/locales/${language}.ts`)))
  }

  await i18nInstance.init({
    lng: locale,
    resources,
    fallbackLng: i18nConfig.defaultLocale,
    supportedLngs: i18nConfig.locales,
    defaultNS: namespaces[0],
    fallbackNS: namespaces[0],
    ns: namespaces,
    preload: resources ? [] : i18nConfig.locales
  })

  return {
    i18n: i18nInstance,
    resources: { [locale]: i18nInstance.services.resourceStore.data[locale] },
    t: i18nInstance.t
  }
}

const resources = {
  en: { translation: enTranslation },
  vi: { translation: viTranslation }
}

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      ...i18nConfig,
      debug: process.env.NODE_ENV === 'development',
      fallbackLng: 'vi',
      react: {
        useSuspense: true // If you're handling Suspense manually
      },
      interpolation: {
        escapeValue: false
      },
      resources,
      detection: {
        order: ['querystring', 'cookie', 'localStorage', 'navigator'],
        caches: ['cookie']
      }
    })
}

export { i18n, initTranslations, i18nConfig }
