'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useAuthContext } from '@/contexts/AuthContext'

interface CredentialResponse {
  credential: string
  select_by: string
}

interface GoogleAccounts {
  id: {
    initialize: (config: {
      client_id: string
      callback: (response: CredentialResponse) => void
      auto_select: boolean
      cancel_on_tap_outside: boolean
    }) => void
    prompt: (callback: (notification: unknown) => void) => void
    cancel: () => void
  }
}

interface GoogleWindow extends Window {
  google?: {
    accounts: GoogleAccounts
  }
}

type Props = {
  isAuthenticated: boolean
}

export function GoogleOneTapLogin({ isAuthenticated }: Props) {
  const router = useRouter()
  const { loginOauth } = useAuthContext()
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  const [error, setError] = useState('')
  const googleApiRef = useRef<GoogleWindow['google'] | null>(null)
  useEffect(() => {
    if (isAuthenticated || !GOOGLE_CLIENT_ID) {
      return
    }
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const isGoogleOneTapElement =
        target.closest('[id*="credential_picker_container"]') ||
        target.closest('.g_id_onload') ||
        target.closest('iframe[src*="accounts.google.com"]')

      if (!isGoogleOneTapElement && googleApiRef.current) {
        try {
          googleApiRef.current.accounts.id.cancel()
        } catch (error) {
          console.log('Error canceling Google One Tap:', error)
        }
      }
    }

    const handleFocusOut = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      const isGoogleOneTapElement =
        target.closest('[id*="credential_picker_container"]') ||
        target.closest('.g_id_onload') ||
        target.closest('iframe[src*="accounts.google.com"]')

      if (!isGoogleOneTapElement && googleApiRef.current) {
        // Delay to allow for tab navigation
        setTimeout(() => {
          const activeElement = document.activeElement
          const isStillInGoogleOneTap =
            activeElement?.closest('[id*="credential_picker_container"]') ||
            activeElement?.closest('.g_id_onload') ||
            activeElement?.closest('iframe[src*="accounts.google.com"]')

          if (!isStillInGoogleOneTap && googleApiRef.current) {
            try {
              googleApiRef.current.accounts.id.cancel()
            } catch (error) {
              console.log('Error canceling Google One Tap on focus out:', error)
            }
          }
        }, 100)
      }
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('focusin', handleFocusOut)

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('focusin', handleFocusOut)
    }
  }, [isAuthenticated, GOOGLE_CLIENT_ID])

  // Early return if no client ID is configured
  if (!GOOGLE_CLIENT_ID) {
    console.warn(
      'Google One Tap: NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured',
    )
    return null
  }

  // Early return if user is already authenticated
  if (isAuthenticated) return null

  const callback = async (response: CredentialResponse) => {
    try {
      // Call API to the server to get the user data
      const tokens = await axios.post('/api/auth/jobseekers/one-tap', {
        credential: response.credential,
      })

      const result = tokens.data.data

      await loginOauth(
        result.accessToken,
        result.refreshToken,
        result.expiresAt,
      )

      setTimeout(() => {
        router.refresh()
      }, 500)
    } catch (error) {
      console.error('Google One Tap authentication failed:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Đăng nhập Google One Tap thất bại'
      setError(errorMessage)
    }
  }

  return (
    <>
      <Script
        id="google-one-tap"
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          const google = (window as GoogleWindow).google
          // Store reference to Google API
          googleApiRef.current = google
          // Initialize immediately after script loads
          if (google?.accounts?.id && GOOGLE_CLIENT_ID) {
            console.log('initialize', window.location.origin)

            google.accounts.id.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback,
              // Add additional configuration for better UX
              auto_select: false,
              cancel_on_tap_outside: false,
            })

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            google.accounts.id.prompt((notification: any) => {
              if (
                notification.isNotDisplayed() ||
                notification.isSkippedMoment()
              ) {
                console.log(
                  'Google One Tap prompt not displayed:',
                  notification.getNotDisplayedReason(),
                )
              }
            })
          } else {
            console.warn(
              'Google One Tap: Script loaded but API not available or client ID missing',
            )
          }
        }}
      />

      {/* note: A notice dialog to show the error message */}
      {/* <NoticeDialog
        message={error}
        onClose={() => setError('')}
        open={!!error}
      /> */}
    </>
  )
}
