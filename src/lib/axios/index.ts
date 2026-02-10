import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios'

const applyInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    function (response) {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      return response
    },
    function (error) {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      return Promise.reject(error)
    },
  )

  instance.interceptors.request.use(
    function (config) {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with request config
      return config
    },
    function (error) {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with request error
      return Promise.reject(error)
    },
  )
}

export const createInstance = (config?: CreateAxiosDefaults) => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL, // TODO: Add base URL
    headers: { 'Content-Type': 'application/json' },
    ...config,
  })
  applyInterceptors(instance)
  return instance
}
