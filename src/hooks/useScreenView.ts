import { useState, useEffect, useCallback } from 'react'

export default function useScreenView() {
  const [screenView, setScreenView] = useState<number | null>(null)
  const handleScreenView = useCallback(() => {
    setScreenView(window?.innerWidth)
  }, [])

  useEffect(() => {
    handleScreenView()
  })

  useEffect(() => {
    window?.addEventListener('resize', handleScreenView)

    return () => {
      window?.removeEventListener('resize', handleScreenView)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    screenView: Number(screenView),
    isLaptop: screenView ? screenView < 1024 : false,
    isTablet: screenView ? screenView < 768 : false,
    isMobile: screenView ? screenView < 480 : false
  }
}
