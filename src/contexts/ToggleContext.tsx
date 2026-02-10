'use client'

import {
  createContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react'
import { createToggleStore } from '@/utils/toggle'

const toggleStore = createToggleStore()

export const ToggleStateContext = createContext<{
  handleOpen: (key: string) => void
  handleClose: (key: string) => void
  handleToggle: (key: string) => void
  isToggleOpen: (key: string) => boolean
}>({
  handleOpen: () => {},
  handleClose: () => {},
  handleToggle: () => {},
  isToggleOpen: () => false,
})

/**
 * NOTE:
 * - This template is handle the toggle modal solution and save it to global state
 *
 * []
 */
export function ToggleStateContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const handleOpen = useCallback((key: string) => {
    toggleStore.setToggle(key, true)
  }, [])

  const handleClose = useCallback((key: string) => {
    toggleStore.setToggle(key, false)
  }, [])

  const handleToggle = useCallback((key: string) => {
    toggleStore.toggle(key)
  }, [])

  const isToggleOpen = (key: string) => {
    return useSyncExternalStore(
      (callback) => toggleStore.subscribe(callback),
      () => toggleStore.getState()[key] ?? false,
      () => false, // <-- getServerSnapshot fallback (for SSR)
    )
  }

  const contextValue = useMemo(
    () => ({ handleOpen, handleClose, handleToggle, isToggleOpen }),
    [handleClose, handleOpen, handleToggle, isToggleOpen],
  )

  return (
    <ToggleStateContext value={contextValue}>{children}</ToggleStateContext>
  )
}
