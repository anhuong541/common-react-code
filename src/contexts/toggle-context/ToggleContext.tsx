import { createContext } from 'react'

const ToggleStateContext = createContext<{
  toggleOpen: Record<string, boolean>
  handleOpen: (key: string) => void
  handleClose: (key: string) => void
  handleToggle: (key: string) => void
  isToggleOpen: (key: string) => boolean
}>({
  toggleOpen: {},
  handleOpen: () => {},
  handleClose: () => {},
  handleToggle: () => {},
  isToggleOpen: () => false
})

export default ToggleStateContext
