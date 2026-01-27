export function isDev(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function devLog(
  type: 'log' | 'error' | 'warn' | 'info' = 'log',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...message: any[]
) {
  if (isDev()) {
    console[type](...message)
  }
}
