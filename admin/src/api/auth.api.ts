import { apiClient } from './client'

export interface AdminProfile {
  email: string
}

export interface LoginResponse {
  success: boolean
  message: string
  token: string
  admin: AdminProfile
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/admin/auth/login', { email, password })
  return response.data
}

export const logout = async (): Promise<void> => {
  await apiClient.post('/admin/auth/logout')
}

export const fetchMe = async (): Promise<{ success: boolean; admin: AdminProfile }> => {
  const response = await apiClient.get('/admin/auth/me')
  return response.data
}
