import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type SearchParamsValue = string | string[] | undefined
type SearchParamsObject = Record<string, SearchParamsValue>

export function useHandleSearchParams() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Get current search params as an object
  const currentSearchParams = useMemo(() => {
    const params: SearchParamsObject = {}
    searchParams.forEach((value, key) => {
      // Handle multiple values for the same key
      const existing = params[key]
      if (existing) {
        if (Array.isArray(existing)) {
          existing.push(value)
        } else {
          params[key] = [existing, value]
        }
      } else {
        params[key] = value
      }
    })
    return params
  }, [searchParams])

  // Core function to update search params
  const updateSearchParams = useCallback(
    (updates: SearchParamsObject, options?: { replace?: boolean; scroll?: boolean }) => {
      const newSearchParams = new URLSearchParams(searchParams)
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          newSearchParams.delete(key)
        } else if (Array.isArray(value)) {
          newSearchParams.delete(key)
          value.forEach(v => newSearchParams.append(key, v))
        } else {
          newSearchParams.set(key, String(value))
        }
      })

      const newUrl = `${pathname}?${newSearchParams.toString()}`
      if (options?.replace) {
        router.replace(newUrl, { scroll: options?.scroll ?? true })
      } else {
        router.push(newUrl, { scroll: options?.scroll ?? true })
      }
    },
    [searchParams, pathname, router]
  )

  // Set single parameter
  const setParam = useCallback(
    (key: string, value: string | number, options?: { replace?: boolean; scroll?: boolean }) => {
      updateSearchParams({ [key]: String(value) }, options)
    },
    [updateSearchParams]
  )

  // Toggle parameter (useful for boolean-like params)
  const toggleParam = useCallback(
    (
      key: string,
      onValue = 'true',
      offValue?: string,
      options?: { replace?: boolean; scroll?: boolean }
    ) => {
      const currentValue = searchParams.get(key)
      const newValue = currentValue === onValue ? offValue : onValue
      updateSearchParams({ [key]: newValue }, options)
    },
    [searchParams, updateSearchParams]
  )

  // Add to array parameter (for multi-select scenarios)
  const addToArrayParam = useCallback(
    (key: string, value: string, options?: { replace?: boolean; scroll?: boolean }) => {
      const currentValues = searchParams.getAll(key)
      if (!currentValues.includes(value)) {
        const newValues = [...currentValues, value]
        updateSearchParams({ [key]: newValues }, options)
      }
    },
    [searchParams, updateSearchParams]
  )

  // Remove from array parameter
  const removeFromArrayParam = useCallback(
    (key: string, value: string, options?: { replace?: boolean; scroll?: boolean }) => {
      const currentValues = searchParams.getAll(key)
      const newValues = currentValues.filter(v => v !== value)

      if (newValues.length === 0) {
        updateSearchParams({ [key]: undefined }, options)
      } else {
        updateSearchParams({ [key]: newValues }, options)
      }
    },
    [searchParams, updateSearchParams]
  )

  // Clear all parameters
  const clearAllParams = useCallback(
    (options?: { replace?: boolean; scroll?: boolean }) => {
      const clearedParams: SearchParamsObject = {}
      searchParams.forEach((_, key) => {
        clearedParams[key] = undefined
      })
      updateSearchParams(clearedParams, options)
    },
    [searchParams, updateSearchParams]
  )

  const clearParams = useCallback(
    (keys: string[], options?: { replace?: boolean; scroll?: boolean }) => {
      const clearedParams: SearchParamsObject = {}
      keys.forEach(key => {
        clearedParams[key] = undefined
      })
      updateSearchParams(clearedParams, options)
    },
    [updateSearchParams]
  )

  // Utility functions
  const getParam = useCallback(
    (key: string): string | null => {
      return searchParams.get(key)
    },
    [searchParams]
  )

  const getArrayParam = useCallback(
    (key: string): string[] => {
      return searchParams.getAll(key)
    },
    [searchParams]
  )

  const hasParam = useCallback(
    (key: string): boolean => {
      return searchParams.has(key)
    },
    [searchParams]
  )

  const getParamAsNumber = useCallback(
    (key: string, defaultValue?: number): number | undefined => {
      const value = searchParams.get(key)
      if (value === null) return defaultValue
      const num = Number(value)
      return isNaN(num) ? defaultValue : num
    },
    [searchParams]
  )

  const getParamAsBoolean = useCallback(
    (key: string): boolean => {
      const value = searchParams.get(key)
      return value === 'true' || value === '1' || value === 'on'
    },
    [searchParams]
  )

  return {
    // Nextjs state
    pathname,
    searchParams,

    // Core functionality
    currentSearchParams,
    updateSearchParams,

    // Specific handlers
    setParam,
    toggleParam,
    addToArrayParam,
    removeFromArrayParam,
    clearAllParams,
    clearParams,

    // Utility functions
    getParam,
    getArrayParam,
    hasParam,
    getParamAsNumber,
    getParamAsBoolean,
  }
}
