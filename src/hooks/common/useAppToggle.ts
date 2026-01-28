import { useCallback, useState } from 'react'

// Simple app toggle hook
export default function useAppToggle() {
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

  return { toggleOpen, handleOpen, handleClose, handleToggle, isToggleOpen }
}
