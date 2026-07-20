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
  onDelete: (id: string) => void
}

const Scorecard = ({ data, onUpdate, onStatusChange, onIconChange, onDelete }: ScorecardProps) => {
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
        <button className="delete-button" onClick={() => onDelete(data.id)} aria-label="Delete scorecard">
          ×
        </button>
      </div>
      
      {isEditing && (
        <div className="scorecard-edit-section">
          <span className="edit-label">Icon</span>
          <IconPicker
            selectedIcon={data.icon}
            onSelect={(icon) => onIconChange(data.id, icon)}
          />
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
      
      <button 
        className="edit-toggle-button"
        onClick={() => setIsEditing(prev => !prev)}
      >
        {isEditing ? "Done" : "Edit Icon"}
      </button>
    </div>
  )
}

export default Scorecard