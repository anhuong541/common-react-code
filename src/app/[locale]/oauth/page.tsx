'use client'

import ProcessOAuth from '@/components/Home/components/ProcessOAuth'
import { Suspense } from 'react'

export default function OAuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProcessOAuth />
    </Suspense>
  )
}
