'use client'

import { Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ContextProvider from '@/contexts/ContextProvider'

const queryClient = new QueryClient()

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ContextProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ContextProvider>
  )
}
