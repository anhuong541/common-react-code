'use client'

import { Trans } from 'react-i18next'

export default function TransText({ i18nKey }: { i18nKey: string }) {
  return <Trans i18nKey={i18nKey} />
}
