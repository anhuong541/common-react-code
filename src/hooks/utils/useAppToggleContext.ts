import { use } from 'react'
import { ToggleStateContext } from '@/contexts/ToggleContext'

export default function useAppToggleContext() {
  const context = use(ToggleStateContext)
  if (!context) {
    throw new Error(
      'useAppToggleContext must be used within a ToggleStateContextProvider',
    )
  }

  return context
}
