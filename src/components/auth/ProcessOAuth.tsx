'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useFirstMount from '@/hooks/common/useFirstMount'
import useOnMount from '@/hooks/common/useOnMount'

export default function ProcessOAuth() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isMount: isHydrated } = useFirstMount()

  useEffect(() => {
    if (!isHydrated) return

    const processOAuthCallback = async () => {
      try {
        console.group('processOAuthCallback')
        const isPopup = window.opener && window.opener !== window && !window.opener.closed

        const dataParam = searchParams.get('data')
        const error = searchParams.get('error')

        let accessToken: string | null = null
        let refreshToken: string | null = null
        let expiresIn: string | null = null

        if (dataParam) {
          try {
            const decodedData = atob(dataParam)
            const urlParams = new URLSearchParams(decodedData)
            accessToken = urlParams.get('at')
            refreshToken = urlParams.get('rt')
            expiresIn = urlParams.get('exp') || urlParams.get('e')
          } catch (decodeError) {
            console.error('Error decoding OAuth data:', decodeError)
            const urlParams = new URLSearchParams(dataParam)
            accessToken = urlParams.get('at')
            refreshToken = urlParams.get('rt')
            expiresIn = urlParams.get('exp') || urlParams.get('e')
          }
        }

        if (error) {
          if (isPopup) {
            const result = {
              type: 'OAUTH_RESULT',
              success: false,
              error: decodeURIComponent(error),
            }

            if (window.opener && !window.opener.closed) {
              window.opener.postMessage(result, window.location.origin)
            }

            // setTimeout(() => window.close(), 500)
          }
          return
        }

        if (accessToken && refreshToken && expiresIn) {
          const tokenData = {
            accessToken,
            refreshToken,
            expiresIn: parseInt(expiresIn, 10),
            tokenType: 'Bearer',
          }

          if (isPopup) {
            const result = {
              type: 'OAUTH_RESULT',
              success: true,
              token: tokenData.accessToken,
              refreshToken: tokenData.refreshToken,
              expiresIn: tokenData.expiresIn,
            }

            window.history.replaceState({}, document.title, '/')

            if (window.opener && !window.opener.closed) {
              window.opener.postMessage(result, window.location.origin)
            }

            /**
             * Note: This is the path for handle the OAuth callback after a popup is opened
             */
          } else {
            /**
             * Note: This is the path for handle the OAuth callback after a popup is closed
             */
          }
        }
      } catch (error) {
        console.error(error)
      }
      console.groupEnd()
    }

    if (searchParams.get('data') || searchParams.get('error')) {
      processOAuthCallback()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, router])
  return null
}
