import { useState } from "react";
import IconPicker from "../iconPicker/IconPicker";

export interface ScorecardData {
  id: string
  area: string
  icon: string
  current: number
  target: number
  status: string
}

interface ScorecardProps {
  data: ScorecardData
  onUpdate: (id: string, current: number) => void
  onStatusChange: (id: string, status: string) => void
  onIconChange: (id: string, icon: string) => void
  onAreaChange: (id: string, area: string) => void
  onTargetChange: (id: string, target: number) => void
  onDelete: (id: string) => void
}

const Scorecard = ({ data, onUpdate, onStatusChange, onIconChange, onAreaChange, onTargetChange, onDelete }: ScorecardProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const percentage = data.target > 0 ? Math.round((data.current / data.target) * 100) : 0

  const handleIncrement = () => {
    onUpdate(data.id, data.current + 1)
  }

  const handleDecrement = () => {
    if (data.current > 0) {
      onUpdate(data.id, data.current - 1)
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
          <h3>{data.area}</h3>
        </div>
        <div className="scorecard-actions">
          <button 
            className="edit-button" 
            onClick={() => setIsEditing(prev => !prev)}
            aria-label={isEditing ? "Done editing" : "Edit scorecard"}
          >
            {isEditing ? "✓" : "✏️"}
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
        <span className="progress-text">{data.current} / {data.target}</span>
        <span className="percentage">{percentage}%</span>
      </div>
      
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
      
      <div className="scorecard-controls">
        <button onClick={handleDecrement} disabled={data.current <= 0}>−</button>
        <input 
          type="number" 
          value={data.current} 
          onChange={handleProgressChange}
          min={0}
          max={data.target}
        />
        <button onClick={handleIncrement} disabled={data.current >= data.target}>+</button>
      </div>
      
      <input 
        type="text" 
        className="status-input"
        value={data.status} 
        onChange={(e) => onStatusChange(data.id, e.target.value)}
        placeholder="Status"
      />
      
    </div>
  )
}

export default Scorecard