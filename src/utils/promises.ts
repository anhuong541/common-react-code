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
 * Executes a promise and returns the result or a fallback value if it fails.
 * Enhanced with developer-friendly error logging, including a cURL command.
 *
 * @param promise - The promise to execute (which should ideally encapsulate the API call).
 * @param requestOptions - The options that describe the HTTP request made (for cURL generation).
 * @param fallbackValue - The value to return if the promise fails.
 * @param errorContext - Optional context for logging (e.g., 'brandDetail', 'vipJobs').
 * @returns The promise result or fallback value.
 */
export async function getServerSideAPI<T>(
  promise: Promise<T>,
  options?: {
    requestOptions?: RequestCurlOptions
    fallbackValue?: T
    errorContext?: string
  }
): Promise<T | null> {
  const { requestOptions, fallbackValue, errorContext } = options ?? {}
  try {
    return await promise
  } catch (error: unknown) {
    const contextPrefix = errorContext ? chalk.cyan(`[${errorContext}]`) : ''
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error(`\n${chalk.red('🚨 API Call Failed 🚨')} ${contextPrefix}`)
    console.error(`  ${chalk.gray('Timestamp:')} ${new Date().toISOString()}`)
    console.error(`  ${chalk.gray('Error Message:')} ${chalk.yellow(errorMessage)}`)

    if (requestOptions) {
      // --- NEW: cURL Command Generation ---
      const curlCommand = generateCurlCommand(requestOptions)
      console.error(`  ${chalk.gray('cURL Command (copy & paste to terminal/Postman):')}`)
      console.error(chalk.blue(`    ${curlCommand}`)) // Blue for the curl command
      // --- End cURL Command Generation ---
    }

    if (errorStack) {
      console.error(`  ${chalk.gray('Stack Trace:')}`)
      console.error(
        chalk.gray(
          errorStack
            .split('\n')
            .map(line => `    ${line}`)
            .join('\n')
        )
      )
    }

    if (fallbackValue !== undefined) {
      console.error(
        `  ${chalk.gray('Returning Fallback Value:')} ${chalk.green(JSON.stringify(fallbackValue))}`
      )
    } else {
      console.error(`  ${chalk.gray('No fallback value provided, returning null.')}`)
    }
    console.error('\n')

    return fallbackValue ?? null
  }
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
