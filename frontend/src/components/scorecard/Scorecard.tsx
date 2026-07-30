import { useState } from "react";
import { Pencil, Check, Flame, Trash2, Plus, MoreHorizontal, History } from "lucide-react";
import IconPicker from "../iconPicker/IconPicker";
import { getAreaIcon } from "../iconPicker/iconOptions";
import { computePace } from "../../utils/pace";
import { computeCurrentStreak, computeBestStreak, todayKey } from "../../utils/date";

export interface ScorecardData {
  id: string
  area: string
  goal: string
  icon: string
  color?: string
  target: number
  startingCount: number
  activities: Activity[]
}

export interface Activity {
  id: string
  loggedAt: string
  description?: string
  url?: string
}

interface ScorecardProps {
  data: ScorecardData
  daysElapsed: number
  totalDays: number
  onIconChange: (id: string, icon: string) => void
  onColorChange: (id: string, color: string) => void
  onAreaChange: (id: string, area: string) => void
  onGoalChange: (id: string, goal: string) => void
  onTargetChange: (id: string, target: number) => void
  onDelete: (id: string) => void
  onLogActivity: (id: string) => void
  onViewHistory: (id: string) => void
  celebrationId?: number
}

const getProgressClass = (percentage: number) => {
  if (percentage >= 100) return "complete"
  if (percentage >= 75) return "high"
  if (percentage >= 40) return "medium"
  return "low"
}

const Scorecard = ({ data, daysElapsed, totalDays, onIconChange, onColorChange, onAreaChange, onGoalChange, onTargetChange, onDelete, onLogActivity, onViewHistory, celebrationId }: ScorecardProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const AreaIcon = getAreaIcon(data.icon)
  const current = data.startingCount + data.activities.length
  const percentage = data.target > 0 ? Math.min(100, Math.round((current / data.target) * 100)) : 0
  const progressClass = getProgressClass(percentage)
  const isCompleted = percentage >= 100
  const pace = computePace(current, data.target, daysElapsed, totalDays)
  const activityDays = data.activities.map(activity => todayKey(new Date(activity.loggedAt)))
  const currentStreak = computeCurrentStreak(activityDays)
  const bestStreak = computeBestStreak(activityDays)

  return (
    <div className="scorecard">
      <div className="scorecard-header">
        <div className="scorecard-title" title={data.goal} aria-label={`${data.area}: ${data.goal}`}>
          <span className="scorecard-icon" style={{ color: data.color }}><AreaIcon size={20} /></span>
          <div className="scorecard-title-text">
            <h3>{data.area}</h3>
            <div className="scorecard-badges">
              {isCompleted && <span className="completed-badge"><Check size={12} /> Done</span>}
              {!isCompleted && currentStreak > 0 && (
                <span className="streak-badge" title={`Best streak: ${bestStreak} day${bestStreak === 1 ? "" : "s"}`}>
                  <Flame size={12} /> {currentStreak}-day streak
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="scorecard-actions">
          <button
            type="button"
            className="scorecard-menu-button"
            onClick={() => setSettingsOpen(open => !open)}
            aria-label="Scorecard options"
            aria-expanded={settingsOpen}
          >
            <MoreHorizontal size={18} />
          </button>
          {settingsOpen && (
            <div className="scorecard-action-menu">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(editing => !editing)
                  setSettingsOpen(false)
                }}
                aria-label={isEditing ? "Done editing" : "Edit scorecard"}
              >
                {isEditing ? <Check size={15} /> : <Pencil size={15} />}
                {isEditing ? "Done editing" : "Edit"}
              </button>
              <button
                type="button"
                className="scorecard-action-menu-delete"
                onClick={() => onDelete(data.id)}
                aria-label="Delete scorecard"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="scorecard-edit-form">
          <div className="edit-field">
            <label className="edit-label">Area</label>
            <input
              type="text"
              value={data.area}
              onChange={(e) => onAreaChange(data.id, e.target.value)}
            />
          </div>
          <div className="edit-field">
            <label className="edit-label">Goal</label>
            <input
              type="text"
              value={data.goal}
              onChange={(e) => onGoalChange(data.id, e.target.value)}
              maxLength={500}
            />
          </div>
          <div className="edit-field">
            <label className="edit-label">Target</label>
            <input
              type="number"
              value={data.target}
              onChange={(e) => onTargetChange(data.id, parseInt(e.target.value, 10) || 0)}
              min={1}
            />
          </div>
          <div className="edit-field">
            <label className="edit-label">Icon</label>
            <IconPicker
              selectedIcon={data.icon}
              onSelect={(icon) => onIconChange(data.id, icon)}
            />
          </div>
          <div className="edit-field">
            <label className="edit-label">Color</label>
            <input
              type="color"
              value={data.color || "#4f46e5"}
              onChange={(e) => onColorChange(data.id, e.target.value)}
              aria-label="Scorecard color"
            />
          </div>
        </div>
      )}
      
      <div className="scorecard-progress">
        <span className="progress-text">{current} <span className="progress-divider">/</span> {data.target}</span>
        <span className={`percentage ${progressClass}`}>{percentage}%</span>
      </div>

      <div className="progress-bar">
        <div className={`progress-fill ${progressClass}`} style={{ width: `${percentage}%` }} />
      </div>

      <span className={`pace-badge pace-${pace.className}`}>{pace.label}</span>

      <div className="scorecard-controls">
        <button
          className="activity-action-button history-button"
          onClick={() => onViewHistory(data.id)}
          aria-label={`View ${data.area} activity history`}
        >
          <History size={16} /> History
        </button>
        <button
          key={celebrationId ?? "ready"}
          className={`activity-action-button log-today-button ${celebrationId ? "is-celebrating" : ""}`}
          onClick={() => onLogActivity(data.id)}
          aria-label={celebrationId ? `Activity logged for ${data.area}` : `Log an activity for ${data.area}`}
        >
          <span className="log-button-content log-button-default" aria-live="polite">
            <Plus size={16} />
            <span>Log</span>
          </span>
          {celebrationId && (
            <>
              <span className="log-button-content log-button-success" aria-hidden="true">
                <Check size={16} />
                <span>Logged!</span>
              </span>
            <span className="log-celebration-burst" aria-hidden="true">
              {Array.from({ length: 8 }, (_, index) => <span key={`${celebrationId}-${index}`} className={`burst-particle particle-${index + 1}`} />)}
            </span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default Scorecard
