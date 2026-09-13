export const formatCurrency = (amount: number, locale: string, currency = 'SAR') =>
  new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-SA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)

export const formatDate = (date: string | Date, locale: string) =>
  new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))

export const formatTime = (date: string | Date, locale: string) =>
  new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
