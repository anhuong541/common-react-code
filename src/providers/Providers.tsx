import ClientProvider from './ClientProvider'

// Note: This Component will handle server state management and client state management
export default async function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientProvider>{children}</ClientProvider>
}
