import { useContext } from 'react'
import { ToggleStateContext } from '@/contexts/toggle-context'

export default function useAppToggle() {
  const context = useContext(ToggleStateContext)
  if (!context) {
    throw new Error('useAppToggle must be used within a ToggleStateContextProvider')
  }

  return context
}
