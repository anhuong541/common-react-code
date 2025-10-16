import { AxiosError } from 'axios'

type Result<T, E = Error> = Success<T> | Failure<E>
type Success<T> = { data: T; error: null }
type Failure<E> = { data: null; error: E }

export const wait = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    return { data: await promise, error: null }
  } catch (error) {
    return { error: error as E, data: null }
  }
}

/**
 * Executes a promise and returns the result or a fallback value if it fails
 * @param promise - The promise to execute
 * @param fallbackValue - The value to return if the promise fails
 * @param errorContext - Optional context for logging (e.g., 'brandDetail', 'vipJobs')
 * @returns The promise result or fallback value
 */
export async function getServerSideAPI<T>(
  promise: Promise<T>,
  fallbackValue?: T,
  errorContext?: string
): Promise<T | null> {
  try {
    return await promise
  } catch (error: unknown) {
    // Check if it's an Axios error
    if (error instanceof AxiosError) {
      const axiosError = error
      const errorDetails = {
        context: errorContext || 'Unknown',
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        url: axiosError.config?.url,
        method: axiosError.config?.method?.toUpperCase(),
        message: axiosError.message,
        responseData: axiosError.response?.data,
      }

      console.error(
        `[${errorContext || 'API'}] Axios request failed:`,
        JSON.stringify(errorDetails, null, 2)
      )
    } else {
      // Non-Axios error
      if (errorContext) {
        console.error(`[${errorContext}] API call failed:`, error)
      } else {
        console.error('API call failed:', error)
      }
    }
    return fallbackValue ?? null
  }
}
