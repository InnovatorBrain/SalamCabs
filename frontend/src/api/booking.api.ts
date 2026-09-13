import { apiClient } from './client'

export interface BookingPayload {
  tripType: 'oneWay' | 'roundTrip' | 'byHour'
  tripTypeLabel: string
  route: string
  from?: string
  to?: string
  roundTripPackage?: string
  date: string
  time: string
  passengers: number
  specialRequests?: string
  jeddahHajjPickup: boolean
  hajjDropoff: boolean
  vehicle: string
  vehicleName?: string
  fullName: string
  phone: string
  email: string
  flightNo?: string
  paymentMethod: 'cash'
  basePrice: number | null
  surcharge: number
  totalPrice: number | null
}

export interface BookingRecord extends BookingPayload {
  _id: string
  bookingId: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface CreateBookingResponse {
  success: boolean
  message: string
  bookingId: string
  booking: BookingRecord
}

// Always hits the real backend (backend/) so bookings are persisted in
// MongoDB and a confirmation email is sent — this flow is intentionally
// not affected by VITE_USE_MOCK.
export const createBooking = async (payload: BookingPayload): Promise<CreateBookingResponse> => {
  const response = await apiClient.post<CreateBookingResponse>('/bookings', payload)
  return response.data
}
