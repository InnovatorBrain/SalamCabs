import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { UploadCloud } from 'lucide-react'
import type { Vehicle, OneWayRoute, RoundTripPackage, Surcharge } from '@/api/rateCard.api'
import { uploadVehicleImage } from '@/api/rateCard.api'
import { PriceGrid } from '@/components/PriceGrid'

const toPriceState = (prices: Record<string, number> = {}): Record<string, number | ''> => ({ ...prices })

const cleanPrices = (prices: Record<string, number | ''>): Record<string, number> => {
  const clean: Record<string, number> = {}
  Object.entries(prices).forEach(([key, value]) => {
    if (value !== '' && Number.isFinite(Number(value))) clean[key] = Number(value)
  })
  return clean
}

/* -------------------------------- Vehicle form -------------------------------- */

interface VehicleFormProps {
  initialValue?: Vehicle | null
  saving: boolean
  onSubmit: (payload: Partial<Vehicle>) => Promise<void>
  onCancel: () => void
}

export const VehicleForm = ({ initialValue, saving, onSubmit, onCancel }: VehicleFormProps) => {
  const [name, setName] = useState(initialValue?.name ?? '')
  const [nameAr, setNameAr] = useState(initialValue?.nameAr ?? '')
  const [category, setCategory] = useState(initialValue?.category ?? '')
  const [categoryAr, setCategoryAr] = useState(initialValue?.categoryAr ?? '')
  const [description, setDescription] = useState(initialValue?.description ?? '')
  const [descriptionAr, setDescriptionAr] = useState(initialValue?.descriptionAr ?? '')
  const [rating, setRating] = useState(initialValue?.rating ?? 4.8)
  const [pax, setPax] = useState(initialValue?.pax ?? '')
  const [luggage, setLuggage] = useState(initialValue?.luggage ?? '')
  const [image, setImage] = useState(initialValue?.image ?? '')
  const [imagePublicId, setImagePublicId] = useState(initialValue?.imagePublicId ?? '')
  const [order, setOrder] = useState(initialValue?.order ?? 0)
  const [isActive, setIsActive] = useState(initialValue?.isActive ?? true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    setUploading(true)
    try {
      const uploaded = await uploadVehicleImage(file)
      setImage(uploaded.url)
      setImagePublicId(uploaded.publicId)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!image) {
      setUploadError('Please upload a vehicle photo before saving')
      return
    }
    await onSubmit({
      name,
      nameAr,
      category,
      categoryAr,
      description,
      descriptionAr,
      rating,
      pax,
      luggage,
      image,
      imagePublicId,
      order,
      isActive,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rc-form">
      {initialValue && (
        <div className="form-field">
          <label>Vehicle ID (slug)</label>
          <input value={initialValue.vehicleId} disabled />
          <p className="form-hint">Used internally to link prices — cannot be changed.</p>
        </div>
      )}
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="v-name">Name (English) *</label>
          <input id="v-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-field">
          <label htmlFor="v-nameAr">Name (Arabic)</label>
          <input id="v-nameAr" value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="v-category">Category (English)</label>
          <input
            id="v-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Sedan, Van, Luxury SUV, Bus"
          />
        </div>
        <div className="form-field">
          <label htmlFor="v-categoryAr">Category (Arabic)</label>
          <input id="v-categoryAr" value={categoryAr} onChange={(e) => setCategoryAr(e.target.value)} dir="rtl" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="v-desc">Short description (English)</label>
          <input
            id="v-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Shown on the homepage fleet showcase"
          />
        </div>
        <div className="form-field">
          <label htmlFor="v-descAr">Short description (Arabic)</label>
          <input id="v-descAr" value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} dir="rtl" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="v-pax">Passenger capacity *</label>
          <input id="v-pax" value={pax} onChange={(e) => setPax(e.target.value)} placeholder="e.g. 2–3" required />
        </div>
        <div className="form-field">
          <label htmlFor="v-luggage">Luggage capacity *</label>
          <input
            id="v-luggage"
            value={luggage}
            onChange={(e) => setLuggage(e.target.value)}
            placeholder="e.g. 2 large + 1 small bag"
            required
          />
        </div>
      </div>
      <div className="form-field">
        <label>Vehicle photo *</label>
        <div className="image-upload-row">
          {image && <img src={image} alt="Vehicle preview" className="image-upload-preview" />}
          <div className="image-upload-controls">
            <input
              ref={fileInputRef}
              id="v-image-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelected}
              disabled={uploading}
              hidden
            />
            <button
              type="button"
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <UploadCloud size={16} strokeWidth={1.75} />
              {uploading ? 'Uploading…' : image ? 'Replace photo' : 'Upload photo'}
            </button>
            {image && <p className="form-hint image-url-hint">{image}</p>}
          </div>
        </div>
        {uploadError && <p className="form-error">{uploadError}</p>}
        {!uploadError && (
          <p className="form-hint">
            JPG, PNG, WEBP or GIF, up to 5MB. Stored on Cloudinary and shown on the booking page and here.
          </p>
        )}
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="v-rating">Rating (0–5)</label>
          <input
            id="v-rating"
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          />
          <p className="form-hint">Shown next to the vehicle on the homepage fleet showcase.</p>
        </div>
        <div className="form-field">
          <label htmlFor="v-order">Display order</label>
          <input
            id="v-order"
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="form-field form-field-checkbox">
        <label>
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active (visible on the booking form and homepage fleet showcase)
        </label>
      </div>
      <div className="modal-actions">
        <button type="button" className="modal-cancel-btn" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="modal-save-btn" disabled={saving}>
          {saving ? 'Saving…' : 'Save vehicle'}
        </button>
      </div>
    </form>
  )
}

/* ----------------------------- One-way route form ----------------------------- */

interface OneWayRouteFormProps {
  initialValue?: OneWayRoute | null
  vehicles: Vehicle[]
  saving: boolean
  onSubmit: (payload: Partial<OneWayRoute>) => Promise<void>
  onCancel: () => void
}

export const OneWayRouteForm = ({ initialValue, vehicles, saving, onSubmit, onCancel }: OneWayRouteFormProps) => {
  const [fromLabel, setFromLabel] = useState(initialValue?.fromLabel ?? '')
  const [fromLabelAr, setFromLabelAr] = useState(initialValue?.fromLabelAr ?? '')
  const [toLabel, setToLabel] = useState(initialValue?.toLabel ?? '')
  const [toLabelAr, setToLabelAr] = useState(initialValue?.toLabelAr ?? '')
  const [prices, setPrices] = useState<Record<string, number | ''>>(toPriceState(initialValue?.prices))
  const [order, setOrder] = useState(initialValue?.order ?? 0)
  const [isActive, setIsActive] = useState(initialValue?.isActive ?? true)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit({
      fromLabel,
      fromLabelAr,
      toLabel,
      toLabelAr,
      prices: cleanPrices(prices),
      order,
      isActive,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rc-form">
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="r-from">From (English) *</label>
          <input id="r-from" value={fromLabel} onChange={(e) => setFromLabel(e.target.value)} required />
        </div>
        <div className="form-field">
          <label htmlFor="r-fromAr">From (Arabic)</label>
          <input id="r-fromAr" value={fromLabelAr} onChange={(e) => setFromLabelAr(e.target.value)} dir="rtl" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="r-to">To (English) *</label>
          <input id="r-to" value={toLabel} onChange={(e) => setToLabel(e.target.value)} required />
        </div>
        <div className="form-field">
          <label htmlFor="r-toAr">To (Arabic)</label>
          <input id="r-toAr" value={toLabelAr} onChange={(e) => setToLabelAr(e.target.value)} dir="rtl" />
        </div>
      </div>

      <div className="form-field">
        <label>Price per vehicle (SAR)</label>
        <PriceGrid
          vehicles={vehicles}
          prices={prices}
          onChange={(vehicleId, value) => setPrices((prev) => ({ ...prev, [vehicleId]: value }))}
        />
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="r-order">Display order</label>
          <input
            id="r-order"
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>
        <div className="form-field form-field-checkbox">
          <label>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active (visible on the booking form)
          </label>
        </div>
      </div>
      <div className="modal-actions">
        <button type="button" className="modal-cancel-btn" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="modal-save-btn" disabled={saving}>
          {saving ? 'Saving…' : 'Save route'}
        </button>
      </div>
    </form>
  )
}

/* --------------------------- Round-trip package form --------------------------- */

interface RoundTripPackageFormProps {
  initialValue?: RoundTripPackage | null
  vehicles: Vehicle[]
  saving: boolean
  onSubmit: (payload: Partial<RoundTripPackage>) => Promise<void>
  onCancel: () => void
}

export const RoundTripPackageForm = ({
  initialValue,
  vehicles,
  saving,
  onSubmit,
  onCancel,
}: RoundTripPackageFormProps) => {
  const initialLegs = initialValue?.legs ?? ['', '']
  const initialLegsAr = initialValue?.legsAr ?? []
  const [legs, setLegs] = useState<string[]>(initialLegs)
  const [legsAr, setLegsAr] = useState<string[]>(
    initialLegs.map((_, i) => initialLegsAr[i] ?? ''),
  )
  const [prices, setPrices] = useState<Record<string, number | ''>>(toPriceState(initialValue?.prices))
  const [order, setOrder] = useState(initialValue?.order ?? 0)
  const [isActive, setIsActive] = useState(initialValue?.isActive ?? true)

  const updateLeg = (index: number, value: string) => {
    setLegs((prev) => prev.map((leg, i) => (i === index ? value : leg)))
  }
  const updateLegAr = (index: number, value: string) => {
    setLegsAr((prev) => prev.map((leg, i) => (i === index ? value : leg)))
  }
  const addLeg = () => {
    setLegs((prev) => [...prev, ''])
    setLegsAr((prev) => [...prev, ''])
  }
  const removeLeg = (index: number) => {
    setLegs((prev) => prev.filter((_, i) => i !== index))
    setLegsAr((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit({
      legs: legs.map((l) => l.trim()).filter(Boolean),
      legsAr: legsAr.map((l) => l.trim()),
      prices: cleanPrices(prices),
      order,
      isActive,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rc-form">
      <div className="form-field">
        <label>Route legs (in order) *</label>
        <p className="form-hint">
          e.g. Jeddah Airport → Makkah Hotel → Madinah Hotel → Jeddah Airport (at least 2 legs)
        </p>
        <div className="legs-list">
          {legs.map((leg, i) => (
            <div key={i} className="leg-row">
              <span className="leg-index">{i + 1}</span>
              <input
                value={leg}
                onChange={(e) => updateLeg(i, e.target.value)}
                placeholder="Stop (English)"
                required
              />
              <input
                value={legsAr[i] ?? ''}
                onChange={(e) => updateLegAr(i, e.target.value)}
                placeholder="Stop (Arabic)"
                dir="rtl"
              />
              <button
                type="button"
                className="leg-remove-btn"
                onClick={() => removeLeg(i)}
                disabled={legs.length <= 2}
                aria-label="Remove stop"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="add-leg-btn" onClick={addLeg}>
          + Add stop
        </button>
      </div>

      <div className="form-field">
        <label>Price per vehicle (SAR)</label>
        <PriceGrid
          vehicles={vehicles}
          prices={prices}
          onChange={(vehicleId, value) => setPrices((prev) => ({ ...prev, [vehicleId]: value }))}
        />
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="p-order">Display order</label>
          <input
            id="p-order"
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>
        <div className="form-field form-field-checkbox">
          <label>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active (visible on the booking form)
          </label>
        </div>
      </div>
      <div className="modal-actions">
        <button type="button" className="modal-cancel-btn" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="modal-save-btn" disabled={saving}>
          {saving ? 'Saving…' : 'Save package'}
        </button>
      </div>
    </form>
  )
}

/* -------------------------------- Surcharge form -------------------------------- */

interface SurchargeFormProps {
  initialValue?: Surcharge | null
  vehicles: Vehicle[]
  saving: boolean
  onSubmit: (payload: Partial<Surcharge>) => Promise<void>
  onCancel: () => void
}

export const SurchargeForm = ({ initialValue, vehicles, saving, onSubmit, onCancel }: SurchargeFormProps) => {
  const [label, setLabel] = useState(initialValue?.label ?? '')
  const [labelAr, setLabelAr] = useState(initialValue?.labelAr ?? '')
  const [amount, setAmount] = useState(initialValue?.amount ?? 0)
  const [triggerStage, setTriggerStage] = useState<'pickup' | 'dropoff'>(
    initialValue?.triggerStage ?? 'pickup',
  )
  const [triggerMatchLabel, setTriggerMatchLabel] = useState(initialValue?.triggerMatchLabel ?? '')
  const [appliesToVehicleIds, setAppliesToVehicleIds] = useState<string[]>(
    initialValue?.appliesToVehicleIds ?? [],
  )
  const [order, setOrder] = useState(initialValue?.order ?? 0)
  const [isActive, setIsActive] = useState(initialValue?.isActive ?? true)

  const toggleVehicle = (vehicleId: string) => {
    setAppliesToVehicleIds((prev) =>
      prev.includes(vehicleId) ? prev.filter((id) => id !== vehicleId) : [...prev, vehicleId],
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit({
      label,
      labelAr,
      amount,
      triggerStage,
      triggerMatchLabel: triggerStage === 'pickup' ? triggerMatchLabel : '',
      appliesToVehicleIds: triggerStage === 'dropoff' ? appliesToVehicleIds : [],
      order,
      isActive,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rc-form">
      {initialValue && (
        <div className="form-field">
          <label>Key (slug)</label>
          <input value={initialValue.key} disabled />
        </div>
      )}
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="s-label">Label (English) *</label>
          <input id="s-label" value={label} onChange={(e) => setLabel(e.target.value)} required />
        </div>
        <div className="form-field">
          <label htmlFor="s-labelAr">Label (Arabic)</label>
          <input id="s-labelAr" value={labelAr} onChange={(e) => setLabelAr(e.target.value)} dir="rtl" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="s-amount">Amount (SAR) *</label>
          <input
            id="s-amount"
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="s-stage">Shown at *</label>
          <select
            id="s-stage"
            value={triggerStage}
            onChange={(e) => setTriggerStage(e.target.value as 'pickup' | 'dropoff')}
          >
            <option value="pickup">Trip step — pickup surcharge</option>
            <option value="dropoff">Vehicle step — drop-off surcharge</option>
          </select>
        </div>
      </div>

      {triggerStage === 'pickup' ? (
        <div className="form-field">
          <label htmlFor="s-match">Only show when "From" equals (optional)</label>
          <input
            id="s-match"
            value={triggerMatchLabel}
            onChange={(e) => setTriggerMatchLabel(e.target.value)}
            placeholder="e.g. Jeddah Airport (JED) — leave blank to always show"
          />
          <p className="form-hint">
            Must exactly match a route's "From" label (English). Leave blank to show for every one-way trip.
          </p>
        </div>
      ) : (
        <div className="form-field">
          <label>Applies to vehicles (leave all unchecked to apply to every vehicle)</label>
          <div className="vehicle-checkbox-list">
            {vehicles.map((vehicle) => (
              <label key={vehicle.vehicleId} className="vehicle-checkbox-item">
                <input
                  type="checkbox"
                  checked={appliesToVehicleIds.includes(vehicle.vehicleId)}
                  onChange={() => toggleVehicle(vehicle.vehicleId)}
                />
                {vehicle.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="s-order">Display order</label>
          <input
            id="s-order"
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>
        <div className="form-field form-field-checkbox">
          <label>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
        </div>
      </div>
      <div className="modal-actions">
        <button type="button" className="modal-cancel-btn" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="modal-save-btn" disabled={saving}>
          {saving ? 'Saving…' : 'Save surcharge'}
        </button>
      </div>
    </form>
  )
}
