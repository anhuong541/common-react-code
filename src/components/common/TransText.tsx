'use client'

import { useTranslation } from 'react-i18next'

export default function TransText({ i18nKey }: { i18nKey: string }) {
  const { t } = useTranslation()
  return <span>{t(i18nKey)}</span>
}
