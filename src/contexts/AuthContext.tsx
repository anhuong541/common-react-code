'use client'

import React, { createContext, useCallback, useContext, useEffect } from 'react'
import axios from 'axios'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  notifyLogin,
  notifyLogout,
  useListenAuthEvents,
} from '@/utils/broadcastChannel'

interface AuthResponse {
  user: any | null // TODO: Add user type
  token: any | null // TODO: Add token type
}

interface AuthContextValue {
  user: any | null // TODO: Add user type
  token: any | null // TODO: Add token type
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string, saveLogin?: boolean) => Promise<void>
  loginOauth: (
    access_token: string,
    refresh_token: string,
    expired_at: number,
  ) => Promise<void>
  register: (registerData: any) => Promise<void> // TODO: Add register data type
  logout: (callbackUrl?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Fetcher function for React Query
const authFetcher = async (url: string): Promise<AuthResponse> => {
  try {
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    // For 401 errors (unauthenticated), return a valid response instead of throwing
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return { user: null, token: null }
    }
    throw error
  }
}

const AUTH_QUERY_KEY = ['jobseeker-auth']

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = useLocale()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<AuthResponse>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () => authFetcher('/api/auth/jobseekers/me'), // TODO: Add me endpoint
    refetchOnWindowFocus: true,
    initialData: { user: null, token: null }, // TODO: Add initial data
    retry: 2,
  })

  const setAuthCache = useCallback(
    (next: AuthResponse) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, next)
    },
    [queryClient],
  )

  const clearAuthState = useCallback(() => {
    // jskTokenManager.clearPendingRequests()
    setAuthCache({ user: null, token: null })
    router.refresh()
  }, [router, setAuthCache])

  const handleRefreshFailure = useCallback(async () => {
    try {
      await axios.post('/api/auth/jobseekers/logout', {
        withCredentials: true,
      })
    } catch {}

    clearAuthState()
    router.push(`/${locale}/jobseekers/login`)
  }, [clearAuthState, locale, router])

  /**
   * Token manager integration
   */
  useEffect(() => {
    const authState = {
      token: data?.token || null, // TODO: Add token type
      isAuthenticated: !!data?.user,
      isLoading,
    }

    // TODO: Add token manager integration
    // jskTokenManager.setTokenCallback(async () => authState)
    // jskTokenManager.handleAuthStateChange(authState)
    // jskTokenManager.setRefreshCallback(async () => {
    //   try {
    //     const res = await axios.post('/api/auth/jobseekers/refresh')
    //     if (res.data?.success && res.data.token) {
    //       setAuthCache({
    //         user: data?.user || null,
    //         token: res.data.token,
    //       })
    //       return {
    //         success: true,
    //         newToken: res.data.token.accessToken,
    //       }
    //     }
    //     await handleRefreshFailure()
    //     return { success: false }
    //   } catch {
    //     await handleRefreshFailure()
    //     return { success: false }
    //   }
    // })
  }, [data, isLoading, handleRefreshFailure, setAuthCache])

  /**
   * Auth error propagation
   */
  useEffect(() => {
    if (error) {
      // jskTokenManager.handleAuthError(error)
    }
  }, [error])

  /**
   * Cross-tab auth sync
   */
  useListenAuthEvents(
    () => clearAuthState(),
    (user) => {
      if (user) {
        // setUserInfo(user)
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
      }
    },
  )

  /**
   * Actions
   */
  const login = useCallback(
    async (email: string, password: string, saveLogin?: boolean) => {
      const { data: csrf } = await axios.get('/api/auth/csrf')

      const res = await axios.post('/api/auth/jobseekers/login', {
        email,
        password,
        csrfToken: csrf.csrfToken,
        saveLogin: !!saveLogin,
      })

      const userInfo = {
        id: Number(res.data.user.id),
        email: res.data.user.email,
        firstName: res.data.user.first_name,
        lastName: res.data.user.last_name,
        displayName: `${res.data.user.first_name} ${res.data.user.last_name}`,
        avatar: res.data.user.avatar,
        locale,
      }

      // setUserInfo(userInfo)
      notifyLogin(userInfo)

      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
    },
    [locale, queryClient],
  )

  const loginOauth = useCallback(
    async (access_token: string, refresh_token: string, expired_at: number) => {
      const res = await axios.post('/api/auth/jobseekers/login/oauth', {
        access_token,
        refresh_token,
        expires_at: expired_at,
      })

      const userInfo = {
        id: Number(res.data.user.id),
        email: res.data.user.email,
        firstName: res.data.user.first_name,
        lastName: res.data.user.last_name,
        displayName: `${res.data.user.first_name} ${res.data.user.last_name}`,
        avatar: res.data.user.avatar,
        locale,
      }

      // setUserInfo(userInfo)
      notifyLogin(userInfo)

      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
    },
    [locale, queryClient],
  )

  const register = useCallback(
    async (payload: any) => {
      // TODO: Add register data type
      const { data: csrf } = await axios.get('/api/auth/csrf')

      const res = await axios.post('/api/auth/jobseekers/register', {
        ...payload,
        csrfToken: csrf.csrfToken,
      })

      const userInfo = {
        id: Number(res.data.user.id),
        email: res.data.user.email,
        firstName: res.data.user.first_name,
        lastName: res.data.user.last_name,
        displayName: `${res.data.user.first_name} ${res.data.user.last_name}`,
        avatar: res.data.user.avatar,
        locale,
      }

      // setUserInfo(userInfo)
      notifyLogin(userInfo)

      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
    },
    [locale, queryClient],
  )

  const logout = useCallback(
    async (callbackUrl?: string) => {
      try {
        await axios.post('/api/auth/jobseekers/logout', {
          withCredentials: true,
        })
      } finally {
        clearAuthState()
        notifyLogout()
        router.push(callbackUrl || `/${locale}`)
      }
    },
    [clearAuthState, locale, router],
  )

  const value: AuthContextValue = {
    user: data?.user as any | null, // TODO: Add user type
    token: data?.token as any | null, // TODO: Add token type
    isAuthenticated: !!(data?.user as any | null), // TODO: Add user type
    isLoading,
    error: error ? error.message : null,
    login,
    loginOauth,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('AuthContext must be used within JobseekerAuthProvider')
  }
  return ctx
}
