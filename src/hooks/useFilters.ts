'use client'

import { useState, useCallback, useMemo } from 'react'

export interface ActiveFilter {
  id: string
  label: string
  value: string
  displayValue: string
  icon?: React.ReactNode
}

export interface FilterConfig {
  id: string
  label: string
  type: 'text' | 'date' | 'select' | 'checkbox'
  options?: Array<{ value: string; label: string }>
  defaultValue?: any
}

export interface UseFiltersOptions {
  filters: FilterConfig[]
  onFiltersChange?: (filters: ActiveFilter[]) => void
}

export function useFilters({ filters: filterConfigs, onFiltersChange }: UseFiltersOptions) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])

  const addFilter = useCallback(
    (filterId: string, value: any, displayValue: string) => {
      const filterConfig = filterConfigs.find(f => f.id === filterId)
      if (!filterConfig) {
        return
      }

      const newFilter: ActiveFilter = {
        id: filterId,
        label: filterConfig.label,
        value,
        displayValue
      }

      setActiveFilters(prev => {
        const updated = prev.filter(f => f.id !== filterId)
        updated.push(newFilter)
        onFiltersChange?.(updated)
        return updated
      })
    },
    [filterConfigs, onFiltersChange]
  )

  const removeFilter = useCallback(
    (filterId: string) => {
      setActiveFilters(prev => {
        const updated = prev.filter(f => f.id !== filterId)
        onFiltersChange?.(updated)
        return updated
      })
    },
    [onFiltersChange]
  )

  const clearAllFilters = useCallback(() => {
    setActiveFilters([])
    onFiltersChange?.([])
  }, [onFiltersChange])

  const updateFilter = useCallback(
    (filterId: string, value: any, displayValue: string) => {
      setActiveFilters(prev => {
        const updated = prev.map(f => (f.id === filterId ? { ...f, value, displayValue } : f))
        onFiltersChange?.(updated)
        return updated
      })
    },
    [onFiltersChange]
  )

  const getFilterValue = useCallback(
    (filterId: string) => {
      return activeFilters.find(f => f.id === filterId)?.value
    },
    [activeFilters]
  )

  const hasFilter = useCallback(
    (filterId: string) => {
      return activeFilters.some(f => f.id === filterId)
    },
    [activeFilters]
  )

  const filterCount = useMemo(() => activeFilters.length, [activeFilters])

  return {
    activeFilters,
    addFilter,
    removeFilter,
    clearAllFilters,
    updateFilter,
    getFilterValue,
    hasFilter,
    filterCount
  }
}

// Utility function to apply filters to data
export function applyFilters<T>(
  data: T[],
  filters: ActiveFilter[],
  filterFunctions: Record<string, (item: T, value: any) => boolean>
): T[] {
  if (filters.length === 0) {
    return data
  }

  return data.filter(item => {
    return filters.every(filter => {
      const filterFunction = filterFunctions[filter.id]
      if (!filterFunction) {
        return true
      }
      return filterFunction(item, filter.value)
    })
  })
}

// Common filter functions
export const commonFilterFunctions = {
  // Text search (case-insensitive)
  text: (item: any, field: string, searchValue: string) => {
    const fieldValue = item[field]
    if (!fieldValue || !searchValue) {
      return true
    }
    return fieldValue.toLowerCase().includes(searchValue.toLowerCase())
  },

  // Exact match
  exact: (item: any, field: string, value: any) => {
    return item[field] === value
  },

  // Date range
  dateRange: (item: any, field: string, dateRange: [Date, Date]) => {
    const itemDate = new Date(item[field])
    const [startDate, endDate] = dateRange
    return itemDate >= startDate && itemDate <= endDate
  },

  // Boolean
  boolean: (item: any, field: string, value: boolean) => {
    return item[field] === value
  },

  // Array includes
  includes: (item: any, field: string, value: any) => {
    const fieldValue = item[field]
    if (Array.isArray(fieldValue)) {
      return fieldValue.includes(value)
    }
    return fieldValue === value
  }
}
