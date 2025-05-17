import ToggleStateContext from './ToggleContext'
import { useCallback, useMemo, useState } from 'react'

export default function ToggleStateContextProvider({ children }: { children: React.ReactNode }) {
  // FIX: this is a temporary solution to the problem of having multiple unneeded rerenders from the whole app
  // TODO: find a better solution to this problem same at redux
  const [toggleOpen, setToggleOpen] = useState<Record<string, boolean>>({})

  const handleOpen = useCallback((key: string) => {
    setToggleOpen(prev => ({ ...prev, [key]: true }))
  }, [])
  const handleClose = useCallback((key: string) => {
    setToggleOpen(prev => ({ ...prev, [key]: false }))
  }, [])
  const handleToggle = useCallback((key: string) => {
    setToggleOpen(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])
  const isToggleOpen = useCallback((key: string) => toggleOpen[key], [toggleOpen])

  const contextValue = useMemo(
    () => ({ toggleOpen, handleOpen, handleClose, handleToggle, isToggleOpen }),
    [handleClose, handleOpen, handleToggle, isToggleOpen, toggleOpen]
  )

  return <ToggleStateContext value={contextValue}>{children}</ToggleStateContext>
}
