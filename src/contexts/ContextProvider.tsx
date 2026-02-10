import { AuthContextProvider } from './AuthContext'
import { ToggleStateContextProvider } from './ToggleContext'

export default function ContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToggleStateContextProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </ToggleStateContextProvider>
  )
}
