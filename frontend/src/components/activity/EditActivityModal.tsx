import { useState } from "react"
import { X } from "lucide-react"
import type { Activity } from "../scorecard/Scorecard"
import { formatDateLocal } from "../../utils/date"

interface EditActivityModalProps {
  areaName: string
  activity: Activity
  minDate: string
  maxDate: string
  onClose: () => void
  onSubmit: (activity: Activity, date: string, description: string, url: string) => void
}

const EditActivityModal = ({ areaName, activity, minDate, maxDate, onClose, onSubmit }: EditActivityModalProps) => {
  const [loggedDate, setLoggedDate] = useState(formatDateLocal(new Date(activity.loggedAt)))
  const [description, setDescription] = useState(activity.description ?? "")
  const [url, setUrl] = useState(activity.url ?? "")

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal log-activity-modal" role="dialog" aria-modal="true" aria-labelledby="edit-activity-title" onMouseDown={event => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-eyebrow">{areaName}</p>
            <h2 id="edit-activity-title">Edit activity</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <form onSubmit={event => {
          event.preventDefault()
          onSubmit(activity, loggedDate, description.trim(), url.trim())
        }}>
          <label>
            Date
            <input type="date" value={loggedDate} min={minDate} max={maxDate} onChange={event => setLoggedDate(event.target.value)} required />
          </label>
          <label>
            Description <span>optional</span>
            <textarea value={description} onChange={event => setDescription(event.target.value)} rows={3} autoFocus />
          </label>
          <label>
            Link <span>optional</span>
            <input type="url" value={url} onChange={event => setUrl(event.target.value)} placeholder="https://…" />
          </label>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button">Save changes</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default EditActivityModal
