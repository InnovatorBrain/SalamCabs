import type { Vehicle } from '@/api/rateCard.api'

interface PriceGridProps {
  vehicles: Vehicle[]
  prices: Record<string, number | ''>
  onChange: (vehicleId: string, value: number | '') => void
}

// A price input per vehicle type, used by both the one-way route and
// round-trip package forms since they share the same `prices` shape.
export const PriceGrid = ({ vehicles, prices, onChange }: PriceGridProps) => {
  if (vehicles.length === 0) {
    return <p className="form-hint">Add a vehicle first to set prices per vehicle type.</p>
  }

  return (
    <div className="price-grid">
      {vehicles.map((vehicle) => (
        <div key={vehicle.vehicleId} className="price-grid-item">
          <label htmlFor={`price-${vehicle.vehicleId}`}>{vehicle.name}</label>
          <div className="price-grid-input">
            <span>SAR</span>
            <input
              id={`price-${vehicle.vehicleId}`}
              type="number"
              min={0}
              value={prices[vehicle.vehicleId] ?? ''}
              onChange={(e) =>
                onChange(vehicle.vehicleId, e.target.value === '' ? '' : Number(e.target.value))
              }
            />
          </div>
        </div>
      ))}
    </div>
  )
}
