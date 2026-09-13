import { apiClient } from './client'

// Mirrors the backend's rate-card models — everything the booking form needs
// to render vehicles, one-way routes, round-trip packages, and surcharges is
// fetched live from MongoDB instead of a static file.

export type PriceMap = Record<string, number>

export interface VehicleInfo {
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

export interface RateCard {
  vehicles: VehicleInfo[]
  oneWayRoutes: OneWayRoute[]
  roundTripPackages: RoundTripPackage[]
  surcharges: Surcharge[]
}

export const fetchRateCard = async (): Promise<RateCard> => {
  const response = await apiClient.get('/rate-card')
  const { vehicles, oneWayRoutes, roundTripPackages, surcharges } = response.data
  return { vehicles, oneWayRoutes, roundTripPackages, surcharges }
}

export interface LocationOption {
  label: string
  labelAr?: string
}

export const getOneWayDestinations = (routes: OneWayRoute[], fromLabel: string): OneWayRoute[] =>
  fromLabel ? routes.filter((route) => route.fromLabel === fromLabel) : []

export const getDistinctOrigins = (routes: OneWayRoute[]): LocationOption[] => {
  const seen = new Map<string, LocationOption>()
  routes.forEach((route) => {
    if (!seen.has(route.fromLabel)) {
      seen.set(route.fromLabel, { label: route.fromLabel, labelAr: route.fromLabelAr })
    }
  })
  return Array.from(seen.values())
}

export const localizedLabel = (label: string, labelAr: string | undefined, isArabic: boolean): string =>
  isArabic && labelAr ? labelAr : label

export const findOneWayRoute = (
  routes: OneWayRoute[],
  fromLabel: string,
  toLabel: string,
): OneWayRoute | undefined =>
  routes.find((route) => route.fromLabel === fromLabel && route.toLabel === toLabel)

export const findRoundTripPackage = (
  packages: RoundTripPackage[],
  id: string,
): RoundTripPackage | undefined => packages.find((pkg) => pkg._id === id)

export const findVehicle = (vehicles: VehicleInfo[], vehicleId: string): VehicleInfo | undefined =>
  vehicles.find((vehicle) => vehicle.vehicleId === vehicleId)

export const packageLabel = (pkg: RoundTripPackage, isArabic: boolean): string => {
  const legs = isArabic && pkg.legsAr && pkg.legsAr.length === pkg.legs.length ? pkg.legsAr : pkg.legs
  return legs.join(isArabic ? ' ← ' : ' → ')
}

/**
 * Lowest live price found for a vehicle across every active one-way route and
 * round-trip package — used to show a real "Starting from SAR X" figure on
 * the homepage fleet showcase instead of a hardcoded marketing number.
 */
export const startingPriceForVehicle = (
  vehicleId: string,
  oneWayRoutes: OneWayRoute[],
  roundTripPackages: RoundTripPackage[],
): number | null => {
  let min: number | null = null
  const scan = (prices: PriceMap) => {
    const price = prices[vehicleId]
    if (typeof price === 'number' && (min === null || price < min)) min = price
  }
  oneWayRoutes.forEach((route) => scan(route.prices))
  roundTripPackages.forEach((pkg) => scan(pkg.prices))
  return min
}
