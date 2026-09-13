import { apiClient } from './client'

export type TripType = 'oneWay' | 'roundTrip' | 'byHour'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface ConfirmationEmail {
  status: 'pending' | 'sent' | 'failed'
  messageId?: string
  previewUrl?: string
  error?: string
  sentAt?: string
}

export interface Booking {
  _id: string
  bookingId: string
  tripType: TripType
  tripTypeLabel?: string
  route?: string
  from?: string
  to?: string
  roundTripPackage?: string
  date: string
  time: string
  passengers: number
  specialRequests?: string
  jeddahHajjPickup?: boolean
  hajjDropoff?: boolean
  vehicle?: string
  vehicleName?: string
  driverName?: string
  driverPhone?: string
  fullName: string
  phone: string
  email: string
  flightNo?: string
  paymentMethod: 'cash'
  basePrice: number | null
  surcharge: number
  totalPrice: number | null
  status: BookingStatus
  confirmationEmail?: ConfirmationEmail
  createdAt: string
  updatedAt: string
}

export type UpcomingWindow = '1d' | '3d' | '7d' | ''

export interface BookingListParams {
  page?: number
  limit?: number
  status?: BookingStatus | ''
  phone?: string
  email?: string
  upcoming?: UpcomingWindow
}

export interface BookingListResponse {
  success: boolean
  count: number
  total: number
  page: number
  pages: number
  bookings: Booking[]
}

export const getBookings = async (params: BookingListParams = {}): Promise<BookingListResponse> => {
  const response = await apiClient.get<BookingListResponse>('/bookings', { params })
  return response.data
}

export const getBookingById = async (id: string): Promise<{ success: boolean; booking: Booking }> => {
  const response = await apiClient.get(`/bookings/${id}`)
  return response.data
}

export const updateBookingStatus = async (
  id: string,
  status: BookingStatus,
): Promise<{ success: boolean; booking: Booking }> => {
  const response = await apiClient.patch(`/bookings/${id}/status`, { status })
  return response.data
}

export const updateBookingDriver = async (
  id: string,
  driver: { driverName?: string; driverPhone?: string },
): Promise<{ success: boolean; booking: Booking }> => {
  const response = await apiClient.patch(`/bookings/${id}/driver`, driver)
  return response.data
}

export const deleteBooking = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/bookings/${id}`)
  return response.data
}
