import { AlertTriangle, X } from "lucide-react"

interface ConfirmDeleteModalProps {
  title: string
  message: string
  onCancel: () => void
  onConfirm: () => void
}

const ConfirmDeleteModal = ({ title, message, onCancel, onConfirm }: ConfirmDeleteModalProps) => (
  <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
    <section className="modal confirm-delete-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-delete-title" onMouseDown={event => event.stopPropagation()}>
      <div className="modal-header">
        <div className="confirm-delete-title">
          <span><AlertTriangle size={20} /></span>
          <div>
            <p className="modal-eyebrow">This cannot be undone</p>
            <h2 id="confirm-delete-title">{title}</h2>
          </div>
        </div>
        <button type="button" className="modal-close" onClick={onCancel} aria-label="Close"><X size={20} /></button>
      </div>
      <p className="confirm-delete-message">{message}</p>
      <div className="modal-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>Cancel</button>
        <button type="button" className="danger-button" onClick={onConfirm}>Delete</button>
      </div>
    </section>
  </div>
)

export default ConfirmDeleteModal
