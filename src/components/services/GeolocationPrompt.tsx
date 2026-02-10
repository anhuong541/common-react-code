'use client'

import { useEffect } from 'react'

const GEOLOCATION_PROMPT_KEY = '${APP_NAME}_geolocation_prompted'

export function GeolocationPrompt() {
  useEffect(() => {
    // Check if we've already prompted the user
    const prompted = localStorage.getItem(GEOLOCATION_PROMPT_KEY)

    if (prompted) {
      return
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.')
      return
    }

    // Check current permission status
    if ('permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((permissionStatus) => {
          // Only prompt if permission has not been decided yet
          if (permissionStatus.state === 'prompt') {
            // Trigger the native browser geolocation prompt
            requestGeolocation()
          } else {
            // User has already granted or denied permission
            localStorage.setItem(GEOLOCATION_PROMPT_KEY, 'true')
          }
        })
        .catch((error) => {
          console.error('Error checking geolocation permission:', error)
          // Fallback: try to request anyway
          requestGeolocation()
        })
    } else {
      // Fallback for browsers without Permissions API
      requestGeolocation()
    }
  }, [])

  const requestGeolocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success: User granted permission
        console.log('Geolocation granted:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        localStorage.setItem(GEOLOCATION_PROMPT_KEY, 'true')

        // Here you can save the location to state/context/API if needed
        // Example: saveUserLocation(position.coords);
      },
      (error) => {
        // Error: User denied permission or other error
        console.warn('Geolocation denied or error:', error.message)
        localStorage.setItem(GEOLOCATION_PROMPT_KEY, 'true')
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  // This component doesn't render anything
  return null
}
