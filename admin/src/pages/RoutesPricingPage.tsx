import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Circle, CircleCheck } from 'lucide-react'
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getOneWayRoutes,
  createOneWayRoute,
  updateOneWayRoute,
  deleteOneWayRoute,
  getRoundTripPackages,
  createRoundTripPackage,
  updateRoundTripPackage,
  deleteRoundTripPackage,
  type Vehicle,
  type OneWayRoute,
  type RoundTripPackage,
} from '@/api/rateCard.api'
import { Modal } from '@/components/Modal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { VehicleForm, OneWayRouteForm, RoundTripPackageForm } from '@/components/RateCardForms'
import { useToast } from '@/context/ToastContext'

type Tab = 'vehicles' | 'oneWay' | 'roundTrip'

const TABS: { id: Tab; label: string }[] = [
  { id: 'vehicles', label: 'Vehicles' },
  { id: 'oneWay', label: 'One-Way Routes' },
  { id: 'roundTrip', label: 'Round-Trip Packages' },
]

const formatPrices = (vehicles: Vehicle[], prices: Record<string, number>) => {
  const parts = vehicles
    .filter((v) => prices[v.vehicleId] !== undefined)
    .map((v) => `${v.name}: SAR ${prices[v.vehicleId]}`)
  return parts.length > 0 ? parts.join(' · ') : '—'
}

const ActiveIcon = ({ isActive }: { isActive: boolean }) =>
  isActive ? (
    <CircleCheck size={16} strokeWidth={1.75} className="active-icon active-icon-yes" />
  ) : (
    <Circle size={16} strokeWidth={1.75} className="active-icon active-icon-no" />
  )

export const RoutesPricingPage = () => {
  const { showToast } = useToast()
  const [tab, setTab] = useState<Tab>('vehicles')

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [oneWayRoutes, setOneWayRoutes] = useState<OneWayRoute[]>([])
  const [roundTripPackages, setRoundTripPackages] = useState<RoundTripPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Generic "which modal is open, editing what" state shared across tabs.
  const [modal, setModal] = useState<
    | { type: 'vehicle'; item: Vehicle | null }
    | { type: 'oneWay'; item: OneWayRoute | null }
    | { type: 'roundTrip'; item: RoundTripPackage | null }
    | null
  >(null)

  const [deleteTarget, setDeleteTarget] = useState<
    | { type: 'vehicle'; item: Vehicle }
    | { type: 'oneWay'; item: OneWayRoute }
    | { type: 'roundTrip'; item: RoundTripPackage }
    | null
  >(null)
  const [deleting, setDeleting] = useState(false)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [v, r, p] = await Promise.all([getVehicles(), getOneWayRoutes(), getRoundTripPackages()])
      setVehicles(v)
      setOneWayRoutes(r)
      setRoundTripPackages(p)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rate card data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  /* --------------------------------- Save handlers --------------------------------- */

  const handleSaveVehicle = async (payload: Partial<Vehicle>) => {
    setSaving(true)
    try {
      if (modal?.type === 'vehicle' && modal.item) {
        const updated = await updateVehicle(modal.item._id, payload)
        setVehicles((prev) => prev.map((v) => (v._id === updated._id ? updated : v)))
        showToast('Vehicle updated', 'success')
      } else {
        const created = await createVehicle(payload)
        setVehicles((prev) => [...prev, created])
        showToast('Vehicle added', 'success')
      }
      setModal(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save vehicle', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveOneWayRoute = async (payload: Partial<OneWayRoute>) => {
    setSaving(true)
    try {
      if (modal?.type === 'oneWay' && modal.item) {
        const updated = await updateOneWayRoute(modal.item._id, payload)
        setOneWayRoutes((prev) => prev.map((r) => (r._id === updated._id ? updated : r)))
        showToast('Route updated', 'success')
      } else {
        const created = await createOneWayRoute(payload)
        setOneWayRoutes((prev) => [...prev, created])
        showToast('Route added', 'success')
      }
      setModal(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save route', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveRoundTripPackage = async (payload: Partial<RoundTripPackage>) => {
    setSaving(true)
    try {
      if (modal?.type === 'roundTrip' && modal.item) {
        const updated = await updateRoundTripPackage(modal.item._id, payload)
        setRoundTripPackages((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
        showToast('Package updated', 'success')
      } else {
        const created = await createRoundTripPackage(payload)
        setRoundTripPackages((prev) => [...prev, created])
        showToast('Package added', 'success')
      }
      setModal(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save package', 'error')
    } finally {
      setSaving(false)
    }
  }

  /* -------------------------------- Delete handler -------------------------------- */

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      if (deleteTarget.type === 'vehicle') {
        await deleteVehicle(deleteTarget.item._id)
        setVehicles((prev) => prev.filter((v) => v._id !== deleteTarget.item._id))
      } else if (deleteTarget.type === 'oneWay') {
        await deleteOneWayRoute(deleteTarget.item._id)
        setOneWayRoutes((prev) => prev.filter((r) => r._id !== deleteTarget.item._id))
      } else {
        await deleteRoundTripPackage(deleteTarget.item._id)
        setRoundTripPackages((prev) => prev.filter((p) => p._id !== deleteTarget.item._id))
      }
      showToast('Deleted successfully', 'success')
      setDeleteTarget(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const deleteMessage = () => {
    if (!deleteTarget) return ''
    if (deleteTarget.type === 'vehicle') return `Delete vehicle "${deleteTarget.item.name}"? This cannot be undone.`
    if (deleteTarget.type === 'oneWay')
      return `Delete route "${deleteTarget.item.fromLabel} → ${deleteTarget.item.toLabel}"? This cannot be undone.`
    return `Delete package "${deleteTarget.item.legs.join(' → ')}"? This cannot be undone.`
  }

  return (
    <div className="rc-page">
      <div className="page-header">
        <div>
          <h1>Routes &amp; Pricing</h1>
          <p className="page-subtitle">Manage vehicles, routes and packages shown on the booking form.</p>
        </div>
      </div>

      <div className="rc-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`rc-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="form-error mb-3">{error}</p>}

      {loading ? (
        <div className="table-card">
          <p className="table-empty">Loading…</p>
        </div>
      ) : (
        <>
          {tab === 'vehicles' && (
            <div className="table-card">
              <div className="rc-tab-toolbar">
                <button type="button" className="add-btn" onClick={() => setModal({ type: 'vehicle', item: null })}>
                  <Plus size={16} /> Add vehicle
                </button>
              </div>
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Vehicle</th>
                    <th>Category</th>
                    <th>Pax</th>
                    <th>Luggage</th>
                    <th>Order</th>
                    <th>Active</th>
                    <th className="col-actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="table-empty">
                        No vehicles yet.
                      </td>
                    </tr>
                  ) : (
                    vehicles.map((v) => (
                      <tr key={v._id}>
                        <td>
                          <img src={v.image} alt={v.name} className="vehicle-thumb" />
                        </td>
                        <td>
                          <div className="cell-title">{v.name}</div>
                          {v.nameAr && <div className="cell-subtitle">{v.nameAr}</div>}
                        </td>
                        <td>{v.category || '—'}</td>
                        <td>{v.pax}</td>
                        <td>{v.luggage}</td>
                        <td>{v.order}</td>
                        <td>
                          <ActiveIcon isActive={v.isActive} />
                        </td>
                        <td className="col-actions">
                          <div className="row-actions">
                            <button
                              type="button"
                              className="delete-icon-btn"
                              onClick={() => setModal({ type: 'vehicle', item: v })}
                              aria-label={`Edit ${v.name}`}
                            >
                              <Pencil size={16} strokeWidth={1.75} />
                            </button>
                            <button
                              type="button"
                              className="delete-icon-btn"
                              onClick={() => setDeleteTarget({ type: 'vehicle', item: v })}
                              aria-label={`Delete ${v.name}`}
                            >
                              <Trash2 size={16} strokeWidth={1.75} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'oneWay' && (
            <div className="table-card">
              <div className="rc-tab-toolbar">
                <button type="button" className="add-btn" onClick={() => setModal({ type: 'oneWay', item: null })}>
                  <Plus size={16} /> Add route
                </button>
              </div>
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Prices</th>
                    <th>Order</th>
                    <th>Active</th>
                    <th className="col-actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {oneWayRoutes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="table-empty">
                        No one-way routes yet.
                      </td>
                    </tr>
                  ) : (
                    oneWayRoutes.map((r) => (
                      <tr key={r._id}>
                        <td className="cell-title">{r.fromLabel}</td>
                        <td className="cell-title">{r.toLabel}</td>
                        <td className="cell-subtitle">{formatPrices(vehicles, r.prices)}</td>
                        <td>{r.order}</td>
                        <td>
                          <ActiveIcon isActive={r.isActive} />
                        </td>
                        <td className="col-actions">
                          <div className="row-actions">
                            <button
                              type="button"
                              className="delete-icon-btn"
                              onClick={() => setModal({ type: 'oneWay', item: r })}
                              aria-label="Edit route"
                            >
                              <Pencil size={16} strokeWidth={1.75} />
                            </button>
                            <button
                              type="button"
                              className="delete-icon-btn"
                              onClick={() => setDeleteTarget({ type: 'oneWay', item: r })}
                              aria-label="Delete route"
                            >
                              <Trash2 size={16} strokeWidth={1.75} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'roundTrip' && (
            <div className="table-card">
              <div className="rc-tab-toolbar">
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => setModal({ type: 'roundTrip', item: null })}
                >
                  <Plus size={16} /> Add package
                </button>
              </div>
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Prices</th>
                    <th>Order</th>
                    <th>Active</th>
                    <th className="col-actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {roundTripPackages.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="table-empty">
                        No round-trip packages yet.
                      </td>
                    </tr>
                  ) : (
                    roundTripPackages.map((p) => (
                      <tr key={p._id}>
                        <td className="cell-title">{p.legs.join(' → ')}</td>
                        <td className="cell-subtitle">{formatPrices(vehicles, p.prices)}</td>
                        <td>{p.order}</td>
                        <td>
                          <ActiveIcon isActive={p.isActive} />
                        </td>
                        <td className="col-actions">
                          <div className="row-actions">
                            <button
                              type="button"
                              className="delete-icon-btn"
                              onClick={() => setModal({ type: 'roundTrip', item: p })}
                              aria-label="Edit package"
                            >
                              <Pencil size={16} strokeWidth={1.75} />
                            </button>
                            <button
                              type="button"
                              className="delete-icon-btn"
                              onClick={() => setDeleteTarget({ type: 'roundTrip', item: p })}
                              aria-label="Delete package"
                            >
                              <Trash2 size={16} strokeWidth={1.75} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </>
      )}

      <Modal
        open={modal?.type === 'vehicle'}
        title={modal?.type === 'vehicle' && modal.item ? 'Edit vehicle' : 'Add vehicle'}
        onClose={() => setModal(null)}
      >
        <VehicleForm
          initialValue={modal?.type === 'vehicle' ? modal.item : null}
          saving={saving}
          onSubmit={handleSaveVehicle}
          onCancel={() => setModal(null)}
        />
      </Modal>

      <Modal
        open={modal?.type === 'oneWay'}
        title={modal?.type === 'oneWay' && modal.item ? 'Edit route' : 'Add route'}
        onClose={() => setModal(null)}
      >
        <OneWayRouteForm
          initialValue={modal?.type === 'oneWay' ? modal.item : null}
          vehicles={vehicles}
          saving={saving}
          onSubmit={handleSaveOneWayRoute}
          onCancel={() => setModal(null)}
        />
      </Modal>

      <Modal
        open={modal?.type === 'roundTrip'}
        title={modal?.type === 'roundTrip' && modal.item ? 'Edit package' : 'Add package'}
        onClose={() => setModal(null)}
      >
        <RoundTripPackageForm
          initialValue={modal?.type === 'roundTrip' ? modal.item : null}
          vehicles={vehicles}
          saving={saving}
          onSubmit={handleSaveRoundTripPackage}
          onCancel={() => setModal(null)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this item?"
        message={deleteMessage()}
        confirming={deleting}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
