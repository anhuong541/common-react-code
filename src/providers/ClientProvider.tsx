import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'

import ContextProvider from '@/contexts/ContextProvider'

const queryClient = new QueryClient()

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div></div>}>
      <ContextProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ContextProvider>
    </Suspense>
  )
}
