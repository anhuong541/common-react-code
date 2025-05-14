import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

type Result<T, E = Error> = Success<T> | Failure<E>
type Success<T> = { data: T; error: null }
type Failure<E> = { data: null; error: E }

export const cn = (...classes: ClassValue[]) => twMerge(clsx(...classes))

export function getLocalStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const storedValue = localStorage.getItem(key)
    if (storedValue === null) return null
    return JSON.parse(storedValue) as T
  } catch (error) {
    console.error('Error parsing the localStorage value for key:', key, error)
    return null
  }
}

export const toKebabCase = (text: string): string => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const wait = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    return { data: await promise, error: null }
  } catch (error) {
    return { error: error as E, data: null }
  }
}
