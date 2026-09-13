export interface CountryCode {
  code: string
  iso: string
  name: string
  digits: number
}

// Curated list covering Saudi Arabia (default) plus the countries most
// Umrah pilgrims and travellers typically book from. `digits` is the
// expected length of the national number (excluding the country code),
// used to validate mobile numbers and to tell the user exactly how many
// digits to enter.
export const COUNTRY_CODES: CountryCode[] = [
  { code: '+966', iso: 'SA', name: 'Saudi Arabia', digits: 9 },
  { code: '+971', iso: 'AE', name: 'United Arab Emirates', digits: 9 },
  { code: '+973', iso: 'BH', name: 'Bahrain', digits: 8 },
  { code: '+965', iso: 'KW', name: 'Kuwait', digits: 8 },
  { code: '+968', iso: 'OM', name: 'Oman', digits: 8 },
  { code: '+974', iso: 'QA', name: 'Qatar', digits: 8 },
  { code: '+962', iso: 'JO', name: 'Jordan', digits: 9 },
  { code: '+20', iso: 'EG', name: 'Egypt', digits: 10 },
  { code: '+90', iso: 'TR', name: 'Turkey', digits: 10 },
  { code: '+92', iso: 'PK', name: 'Pakistan', digits: 10 },
  { code: '+91', iso: 'IN', name: 'India', digits: 10 },
  { code: '+880', iso: 'BD', name: 'Bangladesh', digits: 10 },
  { code: '+62', iso: 'ID', name: 'Indonesia', digits: 10 },
  { code: '+60', iso: 'MY', name: 'Malaysia', digits: 9 },
  { code: '+44', iso: 'GB', name: 'United Kingdom', digits: 10 },
  { code: '+1', iso: 'US', name: 'USA / Canada', digits: 10 },
]

export const DEFAULT_COUNTRY_CODE = '+966'

export const findCountry = (code: string): CountryCode | undefined =>
  COUNTRY_CODES.find((country) => country.code === code)

export const getExpectedDigits = (code: string): number => findCountry(code)?.digits ?? 8

export const isValidNationalNumber = (nationalNumber: string, code: string): boolean => {
  const digitsOnly = nationalNumber.replace(/\D/g, '')
  return digitsOnly.length === getExpectedDigits(code)
}
