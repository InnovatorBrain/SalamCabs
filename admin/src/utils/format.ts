export const formatCurrency = (amount: number | null): string => {
  if (amount === null || amount === undefined) return '—'
  return `${amount.toLocaleString()} SAR`
}

export const formatDateTime = (value: string): string => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export const tripTypeLabel = (tripType: string): string => {
  if (tripType === 'oneWay') return 'One Way'
  if (tripType === 'roundTrip') return 'Round Trip'
  if (tripType === 'byHour') return 'By Hour'
  return tripType
}
