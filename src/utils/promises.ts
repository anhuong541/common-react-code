import { AxiosError } from 'axios'
import chalk from 'chalk' // Assuming 'chalk' is installed for colors

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

// Define a type for your request options
// This is a simplified version; you might adapt it based on your actual HTTP client
interface RequestCurlOptions {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: Record<string, unknown> | string // For POST/PUT, etc.
}

/**
 * Generates a cURL command string from request options.
 * @param options - The request options.
 * @returns A string representing the cURL command.
 */
function generateCurlCommand(options: RequestCurlOptions): string {
  let command = `curl -X ${options.method.toUpperCase()} '${options.url}'`

  // Add headers
  if (options.headers) {
    for (const key in options.headers) {
      if (Object.hasOwn(options.headers, key)) {
        const value = options.headers[key]
        command += ` -H '${key}: ${value}'`
      }
    }
  }

  // Add body for methods that typically have one
  const methodsWithBody = ['POST', 'PUT', 'PATCH']
  if (options.body && methodsWithBody.includes(options.method.toUpperCase())) {
    let bodyString: string
    if (typeof options.body === 'string') {
      bodyString = options.body
    } else {
      // Assuming JSON body for objects, or handle other types if needed
      bodyString = JSON.stringify(options.body)
      // If not explicitly set, add Content-Type: application/json header
      if (
        !options.headers ||
        !Object.keys(options.headers).some(h => h.toLowerCase() === 'content-type')
      ) {
        command += ` -H 'Content-Type: application/json'`
      }
    }
    // Escape single quotes within the body for shell safety
    const escapedBody = bodyString.replace(/'/g, "'\\''")
    command += ` -d '${escapedBody}'`
  }

  return command
}
