import { apiClient } from './client'

export interface SendOtpPayload {
  countryCode: string
  phone: string
}

export interface SendOtpResponse {
  success: boolean
  message: string
  mock?: boolean
  demoCode?: string
  expiresInSeconds?: number
  otpLength?: number
}

export interface VerifyOtpPayload {
  countryCode: string
  phone: string
  code: string
}

export interface VerifyOtpResponse {
  success: boolean
  message: string
  token: string
  phone: string
  expiresIn: string
}

export const sendOtp = async (payload: SendOtpPayload): Promise<SendOtpResponse> => {
  const response = await apiClient.post<SendOtpResponse>('/otp/send', payload)
  return response.data
}

export const verifyOtp = async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
  const response = await apiClient.post<VerifyOtpResponse>('/otp/verify', payload)
  return response.data
}
