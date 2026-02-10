'use client'

import { Suspense } from 'react'
import ProcessOAuth from '@/components/Home/components/ProcessOAuth'

export default function OAuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProcessOAuth />
    </Suspense>
  )
}
