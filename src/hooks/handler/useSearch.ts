import { useCallback, useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from '../common/useDebounce'

export interface UseSearchOptions {
  initialValue?: string
  delay?: number
  onSearch?: (searchTerm: string) => void
  minLength?: number
}

export interface UseSearchReturn {
  searchTerm: string
  debouncedSearchTerm: string
  isSearching: boolean
  clearSearch: () => void
  handleSearchChange: (searchString: string) => void
  setSearchTerm: (searchString: string) => void
  debouncedSearch: (searchString: string) => void
}

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const { initialValue = '', delay = 500, onSearch, minLength = 0 } = options

  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue)
  const [isSearching, setIsSearching] = useState(false)
  const onSearchRef = useRef(onSearch)

  // Keep the callback ref up to date
  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  const debouncedSearch = useDebouncedCallback((searchString: string) => {
    setDebouncedSearchTerm(searchString)
    setIsSearching(false)

    // Only call onSearch if the search term meets minimum length requirement
    if (onSearchRef.current && searchString.length >= minLength) {
      onSearchRef.current(searchString)
    }
  }, delay)

  const handleSearchChange = useCallback(
    (searchString: string) => {
      setSearchTerm(searchString)
      setIsSearching(true)
      debouncedSearch(searchString)
    },
    [debouncedSearch],
  )

  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
    setIsSearching(false)
    if (onSearchRef.current) {
      onSearchRef.current('')
    }
  }, [])

  return {
    searchTerm,
    isSearching,
    debouncedSearchTerm,
    setSearchTerm,
    handleSearchChange,
    debouncedSearch,
    clearSearch,
  }
}

export default useSearch
