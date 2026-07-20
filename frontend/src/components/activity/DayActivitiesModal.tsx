import { ExternalLink, Plus, X } from "lucide-react"
import type { ScorecardData } from "../scorecard/Scorecard"
import { formatDateLocal } from "../../utils/date"
import { todayKey } from "../../utils/date"

interface DayActivitiesModalProps {
  dateKey: string
  scorecards: ScorecardData[]
  onClose: () => void
  onLogActivity: (dateKey: string) => void
}

const DayActivitiesModal = ({ dateKey, scorecards, onClose, onLogActivity }: DayActivitiesModalProps) => {
  const groups = scorecards.map(card => ({
    card,
    activities: card.activities.filter(activity => formatDateLocal(new Date(activity.loggedAt)) === dateKey).sort((a, b) => b.loggedAt.localeCompare(a.loggedAt)),
  })).filter(group => group.activities.length)
  const label = new Date(`${dateKey}T12:00:00`).toLocaleDateString(undefined, { dateStyle: "full" })
  const canLog = dateKey <= todayKey()

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal day-activities-modal" role="dialog" aria-modal="true" aria-labelledby="day-activities-title" onMouseDown={event => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-eyebrow">Calendar activity</p>
            <h2 id="day-activities-title">{label}</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        {canLog ? <button type="button" className="day-log-button primary-button" onClick={() => onLogActivity(dateKey)}><Plus size={16} /> Log activity</button> : <p className="future-day-note">Activities can be logged on or before today.</p>}
        <div className="day-activity-groups">
          {groups.length ? groups.map(({ card, activities }) => (
            <section key={card.id} className="day-activity-group">
              <h3><span style={{ backgroundColor: card.color }} />{card.area}</h3>
              {activities.map(activity => (
                <div className="day-activity" key={activity.id}>
                  <time>{new Date(activity.loggedAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</time>
                  <div>
                    <p>{activity.description || "Quick log"}</p>
                    {activity.url && <a href={activity.url} target="_blank" rel="noreferrer">Open link <ExternalLink size={14} /></a>}
                  </div>
                </div>
              ))}
            </section>
          )) : <p className="empty-activity-state">No activities logged on this day.</p>}
        </div>
      </section>
    </div>
  )
}

export default DayActivitiesModal
