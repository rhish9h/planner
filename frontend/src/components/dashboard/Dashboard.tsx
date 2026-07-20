import { useState } from "react";
import Scorecard, { type ScorecardData } from "../scorecard/Scorecard";
import IconPicker, { iconOptions } from "../iconPicker/IconPicker";

const initialData: ScorecardData[] = [
  { id: "1", area: "Leetcode", icon: "💻", current: 9, target: 150, status: "slightly behind pace" },
  { id: "2", area: "System Design", icon: "🧩", current: 0, target: 90, status: "needs logging/start" },
  { id: "3", area: "Low Level Design", icon: "🎨", current: 0, target: 60, status: "needs logging/start" },
  { id: "4", area: "Cyclo Veda", icon: "📚", current: 0, target: 120, status: "needs logging/start" },
  { id: "5", area: "Fitness", icon: "🏋️", current: 0, target: 90, status: "needs logging/start" },
  { id: "6", area: "Job Applications", icon: "💼", current: 0, target: 50, status: "needs logging/start" },
]

const Dashboard = () => {
  const [scorecards, setScorecards] = useState<ScorecardData[]>(initialData)
  const [newArea, setNewArea] = useState("")
  const [newTarget, setNewTarget] = useState("")
  const [newIcon, setNewIcon] = useState(iconOptions[0])

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
        <h1>Tracker Dashboard</h1>
      </header>

      <form className="add-scorecard-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Area (e.g. Leetcode)"
          value={newArea}
          onChange={(e) => setNewArea(e.target.value)}
        />
        <input
          type="number"
          placeholder="Target"
          value={newTarget}
          onChange={(e) => setNewTarget(e.target.value)}
          min={1}
        />
        <IconPicker selectedIcon={newIcon} onSelect={setNewIcon} />
        <button type="submit">Add</button>
      </form>

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
          />
        ))}
      </div>
    </div>
  )
}

export default Dashboard