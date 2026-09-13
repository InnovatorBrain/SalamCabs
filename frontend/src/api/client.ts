import axios from 'axios'

const useMock = import.meta.env.VITE_USE_MOCK !== 'false'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  config.headers['X-Request-Id'] = crypto.randomUUID()
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Network error occurred'
    return Promise.reject(new Error(message))
  },
)

export { useMock }
