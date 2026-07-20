import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, ExternalLink, Pencil, Trash2, X } from "lucide-react"
import type { Activity } from "../scorecard/Scorecard"

interface ActivityHistoryModalProps {
  areaName: string
  activities: Activity[]
  onClose: () => void
  onDelete: (id: string) => void
  onEdit: (activity: Activity) => void
}

const formatTimestamp = (value: string) => new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
const PAGE_SIZE = 5

const ActivityHistoryModal = ({ areaName, activities, onClose, onDelete, onEdit }: ActivityHistoryModalProps) => {
  const [page, setPage] = useState(0)
  const pageCount = Math.max(1, Math.ceil(activities.length / PAGE_SIZE))
  const visibleActivities = activities.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  useEffect(() => {
    setPage(current => Math.min(current, pageCount - 1))
  }, [pageCount])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal activity-history-modal" role="dialog" aria-modal="true" aria-labelledby="activity-history-title" onMouseDown={event => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-eyebrow">{areaName}</p>
            <h2 id="activity-history-title">Activity history</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        {activities.length > PAGE_SIZE && <div className="history-summary">Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, activities.length)} of {activities.length}</div>}
        <div className="activity-list">
          {activities.length ? visibleActivities.map(activity => (
          <article className="activity-item" key={activity.id}>
            <div className="activity-content">
              <time>{formatTimestamp(activity.loggedAt)}</time>
              {activity.description && <p>{activity.description}</p>}
              {activity.url && <a href={activity.url} target="_blank" rel="noreferrer">Open link <ExternalLink size={14} /></a>}
              {!activity.description && !activity.url && <p className="activity-quick-log">Quick log</p>}
            </div>
            <div className="activity-actions">
              <button type="button" className="activity-edit" onClick={() => onEdit(activity)} aria-label="Edit this activity"><Pencil size={16} /></button>
              <button type="button" className="activity-delete" onClick={() => onDelete(activity.id)} aria-label="Delete this activity"><Trash2 size={16} /></button>
            </div>
          </article>
          )) : <p className="empty-activity-state">No activities logged yet.</p>}
        </div>
        {pageCount > 1 && <nav className="history-pagination" aria-label="Activity history pages">
          <button type="button" onClick={() => setPage(current => current - 1)} disabled={page === 0}><ChevronLeft size={16} /> Previous</button>
          <span>Page {page + 1} of {pageCount}</span>
          <button type="button" onClick={() => setPage(current => current + 1)} disabled={page === pageCount - 1}>Next <ChevronRight size={16} /></button>
        </nav>}
      </section>
    </div>
  )
}

export default ActivityHistoryModal
