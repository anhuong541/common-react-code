import { createApiInstance } from './axios'

const webClient = createApiInstance({
  baseURL: process.env.NEXT_PUBLIC_URL
})

export { webClient }
