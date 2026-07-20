import { useState } from "react";
import IconPicker from "../iconPicker/IconPicker";
import { computePace } from "../../utils/pace";
import { computeCurrentStreak, computeBestStreak, todayKey } from "../../utils/date";

export interface ScorecardData {
  id: string
  area: string
  icon: string
  current: number
  target: number
  history: string[]
}

interface ScorecardProps {
  data: ScorecardData
  daysElapsed: number
  totalDays: number
  onUpdate: (id: string, current: number) => void
  onIconChange: (id: string, icon: string) => void
  onAreaChange: (id: string, area: string) => void
  onTargetChange: (id: string, target: number) => void
  onDelete: (id: string) => void
  onLogDate: (id: string) => void
  onRemoveDate: (id: string) => void
}

const getProgressClass = (percentage: number) => {
  if (percentage >= 100) return "complete"
  if (percentage >= 75) return "high"
  if (percentage >= 40) return "medium"
  return "low"
}

const Scorecard = ({ data, daysElapsed, totalDays, onUpdate, onIconChange, onAreaChange, onTargetChange, onDelete, onLogDate, onRemoveDate }: ScorecardProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const percentage = data.target > 0 ? Math.round((data.current / data.target) * 100) : 0
  const progressClass = getProgressClass(percentage)
  const isCompleted = percentage === 100
  const pace = computePace(data.current, data.target, daysElapsed, totalDays)
  const currentStreak = computeCurrentStreak(data.history)
  const bestStreak = computeBestStreak(data.history)
  const loggedToday = data.history.includes(todayKey())

  const handleIncrement = () => {
    onUpdate(data.id, data.current + 1)
    onLogDate(data.id)
  }

  const handleDecrement = () => {
    if (data.current > 0) {
      onUpdate(data.id, data.current - 1)
      if (data.history.length > 0) {
        onRemoveDate(data.id)
      }
    }
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0
    onUpdate(data.id, Math.max(0, Math.min(value, data.target)))
  }

  return (
    <div className="scorecard">
      <div className="scorecard-header">
        <div className="scorecard-title">
          <span className="scorecard-icon">{data.icon}</span>
          <div className="scorecard-title-text">
            <h3>{data.area}</h3>
            <div className="scorecard-badges">
              {isCompleted && <span className="completed-badge">✓ Done</span>}
              {!isCompleted && currentStreak > 0 && (
                <span className="streak-badge" title={`Best streak: ${bestStreak} day${bestStreak === 1 ? "" : "s"}`}>
                  🔥 {currentStreak}-day streak
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="scorecard-actions">
          <button 
            className="edit-button" 
            onClick={() => setIsEditing(prev => !prev)}
            aria-label={isEditing ? "Done editing" : "Edit scorecard"}
            aria-expanded={isEditing}
          >
            {isEditing ? "Done" : "Edit"}
          </button>
          <button className="delete-button" onClick={() => onDelete(data.id)} aria-label="Delete scorecard">
            ×
          </button>
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
        </div>
      )}
      
      <div className="scorecard-progress">
        <span className="progress-text">{data.current} <span className="progress-divider">/</span> {data.target}</span>
        <span className={`percentage ${progressClass}`}>{percentage}%</span>
      </div>

      <div className="progress-bar">
        <div className={`progress-fill ${progressClass}`} style={{ width: `${percentage}%` }} />
      </div>

      <span className={`pace-badge pace-${pace.className}`}>{pace.label}</span>

      <div className="scorecard-controls">
        <button
          className="control-button"
          onClick={handleDecrement}
          disabled={data.current <= 0}
          aria-label="Decrease progress"
        >
          −
        </button>
        <input
          type="number"
          value={data.current}
          onChange={handleProgressChange}
          min={0}
          max={data.target}
          aria-label="Current progress"
        />
        <button
          className="control-button"
          onClick={handleIncrement}
          disabled={data.current >= data.target}
          aria-label="Increase progress"
        >
          +
        </button>
        {!isCompleted ? (
          <button
            className={`log-today-button ${loggedToday ? "logged" : ""}`}
            onClick={handleIncrement}
            aria-label="Log today's progress"
          >
            {loggedToday ? "Logged" : "Log today"}
          </button>
        ) : (
          <span className="completed-badge">✓ Done</span>
        )}
      </div>
    </div>
  )
}

export default Scorecard