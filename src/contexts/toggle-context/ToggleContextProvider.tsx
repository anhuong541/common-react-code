import ToggleStateContext from './ToggleContext'
import { useCallback, useMemo, useState } from 'react'

export default function ToggleStateContextProvider({ children }: { children: React.ReactNode }) {
  const [modalsOpen, setModalsOpen] = useState<Record<string, boolean>>({})

  const handleOpen = useCallback((key: string) => {
    setModalsOpen(prev => ({ ...prev, [key]: true }))
  }, [])
  const handleClose = useCallback((key: string) => {
    setModalsOpen(prev => ({ ...prev, [key]: false }))
  }, [])
  const handleToggle = useCallback((key: string) => {
    setModalsOpen(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])
  const isModalOpen = useCallback((key: string) => modalsOpen[key], [modalsOpen])

  const contextValue = useMemo(
    () => ({ modalsOpen, handleOpen, handleClose, handleToggle, isModalOpen }),
    [handleClose, handleOpen, handleToggle, modalsOpen, isModalOpen]
  )

  return <ToggleStateContext value={contextValue}>{children}</ToggleStateContext>
}
