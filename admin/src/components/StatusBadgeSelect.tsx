import type { BookingStatus } from '@/api/bookings.api'

export const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
]

interface StatusBadgeSelectProps {
  value: BookingStatus
  disabled?: boolean
  onChange: (status: BookingStatus) => void
}

export const StatusBadgeSelect = ({ value, disabled, onChange }: StatusBadgeSelectProps) => {
  return (
    <select
      className={`status-select status-${value}`}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as BookingStatus)}
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
