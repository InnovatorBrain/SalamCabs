import { apiClient, useMock } from './client'
import type { ContactFormData } from '@/utils/validation'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const submitContact = async (data: ContactFormData) => {
  if (useMock) {
    await delay(1000)
    return { success: true, message: 'Message received' }
  }
  const response = await apiClient.post('/contact', data)
  return response.data
}
