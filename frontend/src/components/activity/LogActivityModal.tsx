import { useState } from "react"
import { X } from "lucide-react"

interface AreaOption {
  id: string
  name: string
}

interface LogActivityModalProps {
  areas: AreaOption[]
  initialAreaId?: string
  initialDate: string
  minDate: string
  maxDate: string
  onClose: () => void
  onSubmit: (areaId: string, description: string, url: string, date: string) => void
}

const LogActivityModal = ({ areas, initialAreaId, initialDate, minDate, maxDate, onClose, onSubmit }: LogActivityModalProps) => {
  const [areaId, setAreaId] = useState(initialAreaId ?? areas[0]?.id ?? "")
  const [loggedDate, setLoggedDate] = useState(initialDate)
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const selectedArea = areas.find(area => area.id === areaId)

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal log-activity-modal" role="dialog" aria-modal="true" aria-labelledby="log-activity-title" onMouseDown={event => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-eyebrow">{selectedArea?.name ?? "Activity"}</p>
            <h2 id="log-activity-title">Log activity</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <form onSubmit={event => {
          event.preventDefault()
          if (areaId && loggedDate) void onSubmit(areaId, description.trim(), url.trim(), loggedDate)
        }}>
          {!initialAreaId && <label>
            Area
            <select value={areaId} onChange={event => setAreaId(event.target.value)}>
              {areas.map(area => <option key={area.id} value={area.id}>{area.name}</option>)}
            </select>
          </label>}
          <label>
            Date
            <input type="date" value={loggedDate} min={minDate} max={maxDate} onChange={event => setLoggedDate(event.target.value)} required />
          </label>
          <label>
            Description <span>optional</span>
            <textarea value={description} onChange={event => setDescription(event.target.value)} placeholder="e.g. Two Sum II" autoFocus rows={3} />
          </label>
          <label>
            Link <span>optional</span>
            <input type="url" value={url} onChange={event => setUrl(event.target.value)} placeholder="https://…" />
          </label>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button">Log 1 activity</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default LogActivityModal
