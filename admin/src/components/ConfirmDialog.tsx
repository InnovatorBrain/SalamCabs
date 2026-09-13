import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirming?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  confirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!open) return null

  return (
    <div className="confirm-overlay" role="dialog" aria-modal="true" onClick={onCancel}>
      <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-badge">
          <AlertTriangle size={22} strokeWidth={1.75} />
        </div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button type="button" className="confirm-cancel-btn" onClick={onCancel} disabled={confirming}>
            {cancelLabel}
          </button>
          <button type="button" className="confirm-delete-btn" onClick={onConfirm} disabled={confirming}>
            {confirming ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
