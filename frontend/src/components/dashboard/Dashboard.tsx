import { useMemo, useState } from "react";
import Scorecard, { type ScorecardData } from "../scorecard/Scorecard";
import ChallengeCalendar from "../calendar/ChallengeCalendar";
import IconPicker from "../iconPicker/IconPicker";
import { iconOptions } from "../iconPicker/iconOptions";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { computeCurrentStreak, computeBestStreak, daysBetween, todayKey } from "../../utils/date";
import { computePace } from "../../utils/pace";

const TOTAL_DAYS = 90

const initialData: ScorecardData[] = [
  { id: "1", area: "Leetcode", icon: "💻", current: 9, target: 150, history: [] },
  { id: "2", area: "System Design", icon: "🧩", current: 0, target: 90, history: [] },
  { id: "3", area: "Low Level Design", icon: "🎨", current: 0, target: 60, history: [] },
  { id: "4", area: "Cyclo Veda", icon: "📚", current: 0, target: 120, history: [] },
  { id: "5", area: "Fitness", icon: "🏋️", current: 0, target: 90, history: [] },
  { id: "6", area: "Job Applications", icon: "💼", current: 0, target: 50, history: [] },
]

const Dashboard = () => {
  const [scorecards, setScorecards] = useLocalStorage<ScorecardData[]>("tracker.scorecards", initialData)
  const [newArea, setNewArea] = useState("")
  const [newTarget, setNewTarget] = useState("")
  const [newIcon, setNewIcon] = useState(iconOptions[0])
  const [challengeStartKey, setChallengeStartKey] = useLocalStorage<string>("tracker.challengeStart", () => todayKey())

  const challengeStart = useMemo(() => {
    const [y, m, d] = challengeStartKey.split("-").map(Number)
    return new Date(y, (m || 1) - 1, d || 1)
  }, [challengeStartKey])

  const daysElapsed = useMemo(() => {
    return Math.min(TOTAL_DAYS, Math.max(0, daysBetween(challengeStart, new Date()) + 1))
  }, [challengeStart])

  const summary = useMemo(() => {
    const totalGoals = scorecards.length
    const overallPct = totalGoals === 0
      ? 0
      : Math.round(
          scorecards.reduce((sum, card) => sum + Math.min(100, card.target > 0 ? (card.current / card.target) * 100 : 0), 0) / totalGoals
        )

    const onPaceCount = scorecards.filter(card => {
      const { className } = computePace(card.current, card.target, daysElapsed, TOTAL_DAYS)
      return className === "complete" || className === "ahead" || className === "on-pace"
    }).length

    const allHistoryDays = Array.from(new Set(scorecards.flatMap(card => card.history)))
    const currentStreak = computeCurrentStreak(allHistoryDays)
    const bestStreak = computeBestStreak(allHistoryDays)

    return {
      totalGoals,
      overallPct,
      onPaceCount,
      currentStreak,
      bestStreak,
      daysRemaining: Math.max(0, TOTAL_DAYS - daysElapsed),
    }
  }, [scorecards, daysElapsed])

  const handleUpdate = (id: string, current: number) => {
    setScorecards(prev => prev.map(card => 
      card.id === id ? { ...card, current } : card
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

  const handleLogDate = (id: string) => {
    const dateKey = todayKey()
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
          <h1>90-Day Challenge</h1>
          <p className="dashboard-subtitle">
            Day {daysElapsed} of {TOTAL_DAYS} · {summary.daysRemaining} days left — small daily reps compound into big results.
          </p>
        </div>
      </header>

      {scorecards.length > 0 && (
        <section className="dashboard-summary">
          <div className="summary-card">
            <span className="summary-label">Overall progress</span>
            <span className="summary-value">{summary.overallPct}%</span>
            <div className="summary-progress-bar">
              <div className="summary-progress-fill" style={{ width: `${summary.overallPct}%` }} />
            </div>
          </div>
          <div className="summary-card">
            <span className="summary-label">On pace</span>
            <span className="summary-value">{summary.onPaceCount}<span className="summary-value-of"> / {summary.totalGoals}</span></span>
            <p className="summary-hint">goals tracking to target</p>
          </div>
          <div className="summary-card">
            <span className="summary-label">Logging streak</span>
            <span className="summary-value">🔥 {summary.currentStreak}d</span>
            <p className="summary-hint">best: {summary.bestStreak} days</p>
          </div>
        </section>
      )}

      <section className="scorecard-section">
        <h2 className="scorecard-section-title">Your areas</h2>
        {scorecards.length > 0 ? (
          <div className="scorecard-grid">
            {scorecards.map(card => (
              <Scorecard
                key={card.id}
                data={card}
                daysElapsed={daysElapsed}
                totalDays={TOTAL_DAYS}
                onUpdate={handleUpdate}
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
              value={challengeStartKey}
              onChange={(e) => setChallengeStartKey(e.target.value)}
            />
          </label>
        </div>
        <ChallengeCalendar startDate={challengeStart} totalDays={TOTAL_DAYS} scorecards={scorecards} />
      </section>
    </div>
  )
}

export default Dashboard