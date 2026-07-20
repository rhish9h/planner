import { useState } from "react";
import Scorecard, { type ScorecardData } from "../scorecard/Scorecard";
import ChallengeCalendar from "../calendar/ChallengeCalendar";
import IconPicker from "../iconPicker/IconPicker";
import { iconOptions } from "../iconPicker/iconOptions";

const initialData: ScorecardData[] = [
  { id: "1", area: "Leetcode", icon: "💻", current: 9, target: 150, history: [], status: "slightly behind pace" },
  { id: "2", area: "System Design", icon: "🧩", current: 0, target: 90, history: [], status: "needs logging/start" },
  { id: "3", area: "Low Level Design", icon: "🎨", current: 0, target: 60, history: [], status: "needs logging/start" },
  { id: "4", area: "Cyclo Veda", icon: "📚", current: 0, target: 120, history: [], status: "needs logging/start" },
  { id: "5", area: "Fitness", icon: "🏋️", current: 0, target: 90, history: [], status: "needs logging/start" },
  { id: "6", area: "Job Applications", icon: "💼", current: 0, target: 50, history: [], status: "needs logging/start" },
]

const Dashboard = () => {
  const [scorecards, setScorecards] = useState<ScorecardData[]>(initialData)
  const [newArea, setNewArea] = useState("")
  const [newTarget, setNewTarget] = useState("")
  const [newIcon, setNewIcon] = useState(iconOptions[0])
  const [challengeStart, setChallengeStart] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  const handleUpdate = (id: string, current: number) => {
    setScorecards(prev => prev.map(card => 
      card.id === id ? { ...card, current } : card
    ))
  }

  const handleStatusChange = (id: string, status: string) => {
    setScorecards(prev => prev.map(card => 
      card.id === id ? { ...card, status } : card
    ))
  }

  const handleDelete = (id: string) => {
    setScorecards(prev => prev.filter(card => card.id !== id))
  }

  const handleIconChange = (id: string, icon: string) => {
    setScorecards(prev => prev.map(card => 
      card.id === id ? { ...card, icon } : card
    ))
  }

  const handleAreaChange = (id: string, area: string) => {
    setScorecards(prev => prev.map(card => 
      card.id === id ? { ...card, area } : card
    ))
  }

  const handleTargetChange = (id: string, target: number) => {
    if (target <= 0) return
    setScorecards(prev => prev.map(card => 
      card.id === id ? { ...card, target, current: Math.min(card.current, target) } : card
    ))
  }

  const formatDateLocal = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const todaysDate = () => formatDateLocal(new Date())

  const handleLogDate = (id: string) => {
    const dateKey = todaysDate()
    setScorecards(prev => prev.map(card =>
      card.id === id ? { ...card, history: [...card.history, dateKey] } : card
    ))
  }

  const handleRemoveDate = (id: string) => {
    setScorecards(prev => prev.map(card => {
      if (card.id !== id || card.history.length === 0) return card
      return { ...card, history: card.history.slice(0, -1) }
    }))
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const target = parseInt(newTarget, 10)
    if (!newArea.trim() || !target || target <= 0) return

    const newScorecard: ScorecardData = {
      id: crypto.randomUUID(),
      area: newArea.trim(),
      icon: newIcon,
      current: 0,
      target,
      history: [],
      status: "needs logging/start"
    }

    setScorecards(prev => [...prev, newScorecard])
    setNewArea("")
    setNewTarget("")
    setNewIcon(iconOptions[0])
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Tracker Dashboard</h1>
          <p className="dashboard-subtitle">Keep track of your goals, one step at a time.</p>
        </div>
      </header>

      <section className="scorecard-section">
        <h2 className="scorecard-section-title">Your areas</h2>
        {scorecards.length > 0 ? (
          <div className="scorecard-grid">
            {scorecards.map(card => (
              <Scorecard
                key={card.id}
                data={card}
                onUpdate={handleUpdate}
                onStatusChange={handleStatusChange}
                onIconChange={handleIconChange}
                onAreaChange={handleAreaChange}
                onTargetChange={handleTargetChange}
                onDelete={handleDelete}
                onLogDate={handleLogDate}
                onRemoveDate={handleRemoveDate}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <p>No areas yet. Add your first goal below.</p>
          </div>
        )}
      </section>

      <section className="add-scorecard-card">
        <h2 className="add-scorecard-title">Add a new area</h2>
        <form className="add-scorecard-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Area (e.g. Leetcode)"
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            aria-label="Area name"
          />
          <input
            type="number"
            placeholder="Target"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            min={1}
            aria-label="Target value"
          />
          <IconPicker selectedIcon={newIcon} onSelect={setNewIcon} />
          <button type="submit">Add area</button>
        </form>
      </section>

      <section className="calendar-section">
        <div className="calendar-section-header">
          <h2 className="calendar-section-title">90-Day View</h2>
          <label className="calendar-start-label">
            Start date
            <input
              type="date"
              value={formatDateLocal(challengeStart)}
              onChange={(e) => {
                const [y, m, day] = e.target.value.split("-").map(Number)
                const d = new Date(y, (m || 1) - 1, day || 1)
                d.setHours(0, 0, 0, 0)
                setChallengeStart(d)
              }}
            />
          </label>
        </div>
        <ChallengeCalendar startDate={challengeStart} scorecards={scorecards} />
      </section>
    </div>
  )
}

export default Dashboard