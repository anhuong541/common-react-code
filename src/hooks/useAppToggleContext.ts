import { useContext } from 'react'
import { ToggleStateContext } from '@/contexts/toggle-context'

export default function useAppToggleContext() {
  const context = useContext(ToggleStateContext)
  if (!context) {
    throw new Error('useAppToggleContext must be used within a ToggleStateContextProvider')
  }

  return context
}
