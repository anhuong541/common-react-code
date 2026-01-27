import { AxiosError } from 'axios'

/**
 *
 * @param error - The error to log
 * @param label - The label of the error
 * @returns - The error message
 * @description - Logs the usually error from server side
 */

export function axiosErrorLogger(
  error: unknown,
  label: string = 'Axios Request Failed',
) {
  const time = new Date().toISOString()

  console.error('\n===== ⚠️ AXIOS ERROR =====')
  console.error(`Time    : ${time}`)
  console.error(`Where   : ${label}`)

  if (error instanceof AxiosError) {
    console.error(`Type    : AxiosError`)
    console.error(`Message : ${error.message}`)
    console.error(`URL     : ${error.config?.url}`)
    console.error(`Method  : ${error.config?.method}`)
    console.error(`Status  : ${error.response?.status}`)
    console.error(`Headers :`, error.response?.headers ?? null)

    const data = error.response?.data
    if (typeof data === 'string') {
      console.error(
        `Data    : ${data.slice(0, 500)}${data.length > 500 ? ' ...[truncated]' : ''}`,
      )
    } else {
      console.error(`Data    :`, data ?? null)
    }

    console.error('Stack   :', error.stack)
    console.error('===== END AXIOS ERROR =====\n')
    return
  }

  // Fallback khi không phải AxiosError thật sự
  console.error('Type    : NotAxiosError')
  console.error('Value   :', error)
  console.error('===== END AXIOS ERROR =====\n')
}

export function logServerError(
  error: unknown,
  context: string = 'Unknown Server Error',
) {
  const now = new Date().toISOString()

  console.error('\n===== 🛑 SERVER ERROR =====')
  console.error(`Time      : ${now}`)
  console.error(`Context   : ${context}`)

  // Axios Error
  if (error instanceof AxiosError) {
    console.error(`Type      : AxiosError`)
    console.error(`Message   : ${error.message}`)
    console.error(`URL       : ${error.config?.url}`)
    console.error(`Method    : ${error.config?.method}`)
    console.error(`Status    : ${error.response?.status}`)
    console.error(`Response  :`, sanitizeAxiosResponse(error.response?.data))
    console.error('Stack     :', error.stack)
    console.error('===== END ERROR =====\n')
    return
  }

  // Normal JS Error
  if (error instanceof Error) {
    console.error(`Type      : Error`)
    console.error(`Message   : ${error.message}`)
    console.error('Stack     :', error.stack)
    console.error('===== END ERROR =====\n')
    return
  }

  // Unknown error
  console.error('Type      : Unknown Error')
  console.error('Value     :', error)
  console.error('===== END ERROR =====\n')
}

function sanitizeAxiosResponse(data: unknown) {
  if (!data) return null

  // Avoid logging huge HTML bodies or buffers
  if (typeof data === 'string' && data.length > 500) {
    return data.substring(0, 500) + ' ...[truncated]'
  }

  return data
}
