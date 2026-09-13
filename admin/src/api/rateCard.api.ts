import { apiClient } from './client'

export type PriceMap = Record<string, number>

export interface Vehicle {
  _id: string
  vehicleId: string
  name: string
  nameAr?: string
  category?: string
  categoryAr?: string
  description?: string
  descriptionAr?: string
  rating?: number
  pax: string
  luggage: string
  image: string
  imagePublicId?: string
  order: number
  isActive: boolean
}

export interface UploadedImage {
  url: string
  publicId: string
}

export interface OneWayRoute {
  _id: string
  fromLabel: string
  fromLabelAr?: string
  toLabel: string
  toLabelAr?: string
  prices: PriceMap
  order: number
  isActive: boolean
}

export interface RoundTripPackage {
  _id: string
  legs: string[]
  legsAr?: string[]
  prices: PriceMap
  order: number
  isActive: boolean
}

export interface Surcharge {
  _id: string
  key: string
  label: string
  labelAr?: string
  amount: number
  triggerStage: 'pickup' | 'dropoff'
  triggerMatchLabel?: string
  appliesToVehicleIds: string[]
  order: number
  isActive: boolean
}

/* --------------------------------- Uploads --------------------------------- */

export const uploadVehicleImage = async (file: File): Promise<UploadedImage> => {
  const formData = new FormData()
  formData.append('image', file)
  const res = await apiClient.post('/admin/uploads/vehicle-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return { url: res.data.url, publicId: res.data.publicId }
}

/* -------------------------------- Vehicles -------------------------------- */

export const getVehicles = async (): Promise<Vehicle[]> => {
  const res = await apiClient.get('/admin/rate-card/vehicles')
  return res.data.vehicles
}

export const createVehicle = async (payload: Partial<Vehicle>): Promise<Vehicle> => {
  const res = await apiClient.post('/admin/rate-card/vehicles', payload)
  return res.data.vehicle
}

export const updateVehicle = async (id: string, payload: Partial<Vehicle>): Promise<Vehicle> => {
  const res = await apiClient.patch(`/admin/rate-card/vehicles/${id}`, payload)
  return res.data.vehicle
}

export const deleteVehicle = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/rate-card/vehicles/${id}`)
}

/* ----------------------------- One-way routes ----------------------------- */

export const getOneWayRoutes = async (): Promise<OneWayRoute[]> => {
  const res = await apiClient.get('/admin/rate-card/one-way-routes')
  return res.data.oneWayRoutes
}

export const createOneWayRoute = async (payload: Partial<OneWayRoute>): Promise<OneWayRoute> => {
  const res = await apiClient.post('/admin/rate-card/one-way-routes', payload)
  return res.data.route
}

export const updateOneWayRoute = async (
  id: string,
  payload: Partial<OneWayRoute>,
): Promise<OneWayRoute> => {
  const res = await apiClient.patch(`/admin/rate-card/one-way-routes/${id}`, payload)
  return res.data.route
}

export const deleteOneWayRoute = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/rate-card/one-way-routes/${id}`)
}

/* --------------------------- Round-trip packages --------------------------- */

export const getRoundTripPackages = async (): Promise<RoundTripPackage[]> => {
  const res = await apiClient.get('/admin/rate-card/round-trip-packages')
  return res.data.roundTripPackages
}

export const createRoundTripPackage = async (
  payload: Partial<RoundTripPackage>,
): Promise<RoundTripPackage> => {
  const res = await apiClient.post('/admin/rate-card/round-trip-packages', payload)
  return res.data.package
}

export const updateRoundTripPackage = async (
  id: string,
  payload: Partial<RoundTripPackage>,
): Promise<RoundTripPackage> => {
  const res = await apiClient.patch(`/admin/rate-card/round-trip-packages/${id}`, payload)
  return res.data.package
}

export const deleteRoundTripPackage = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/rate-card/round-trip-packages/${id}`)
}

/* -------------------------------- Surcharges -------------------------------- */

export const getSurcharges = async (): Promise<Surcharge[]> => {
  const res = await apiClient.get('/admin/rate-card/surcharges')
  return res.data.surcharges
}

export const createSurcharge = async (payload: Partial<Surcharge>): Promise<Surcharge> => {
  const res = await apiClient.post('/admin/rate-card/surcharges', payload)
  return res.data.surcharge
}

export const updateSurcharge = async (id: string, payload: Partial<Surcharge>): Promise<Surcharge> => {
  const res = await apiClient.patch(`/admin/rate-card/surcharges/${id}`, payload)
  return res.data.surcharge
}

export const deleteSurcharge = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/rate-card/surcharges/${id}`)
}
