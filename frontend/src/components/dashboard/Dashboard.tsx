import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, X, Target, Flame } from "lucide-react";
import Scorecard, { type ScorecardData } from "../scorecard/Scorecard";
import ChallengeCalendar from "../calendar/ChallengeCalendar";
import IconPicker from "../iconPicker/IconPicker";
import { iconOptions, migrateIcon } from "../iconPicker/iconOptions";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { computeCurrentStreak, computeBestStreak, daysBetween, todayKey } from "../../utils/date";
import { computePace } from "../../utils/pace";
import { getDefaultScorecardColor } from "../../utils/colors";

const TOTAL_DAYS = 90

const initialData: ScorecardData[] = [
  { id: "1", area: "Leetcode", icon: "Laptop", color: getDefaultScorecardColor(0), current: 9, target: 150, history: [] },
  { id: "2", area: "System Design", icon: "Puzzle", color: getDefaultScorecardColor(1), current: 0, target: 90, history: [] },
  { id: "3", area: "Low Level Design", icon: "Palette", color: getDefaultScorecardColor(2), current: 0, target: 60, history: [] },
  { id: "4", area: "Cyclo Veda", icon: "BookOpen", color: getDefaultScorecardColor(3), current: 0, target: 120, history: [] },
  { id: "5", area: "Fitness", icon: "Dumbbell", color: getDefaultScorecardColor(4), current: 0, target: 90, history: [] },
  { id: "6", area: "Job Applications", icon: "Briefcase", color: getDefaultScorecardColor(5), current: 0, target: 50, history: [] },
]

const Dashboard = () => {
  const [scorecards, setScorecards] = useLocalStorage<ScorecardData[]>("tracker.scorecards", initialData)
  const migratedRef = useRef(false)
  const [newArea, setNewArea] = useState("")
  const [newTarget, setNewTarget] = useState("")
  const [newIcon, setNewIcon] = useState<string>(iconOptions[0])
  const [newColor, setNewColor] = useState<string>(() => getDefaultScorecardColor(scorecards.length))

  useEffect(() => {
    if (migratedRef.current) return
    migratedRef.current = true
    const migrated = scorecards.map((card, i) => ({
      ...card,
      icon: migrateIcon(card.icon),
      color: card.color ?? getDefaultScorecardColor(i),
    }))
    if (migrated.some((card, i) => card.icon !== scorecards[i].icon || card.color !== scorecards[i].color)) {
      setScorecards(migrated)
    }
  }, [scorecards, setScorecards])
  const [challengeStartKey, setChallengeStartKey] = useLocalStorage<string>("tracker.challengeStart", () => todayKey())
  const [addExpanded, setAddExpanded] = useState(false)

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

  const handleColorChange = (id: string, color: string) => {
    setScorecards(prev => prev.map(card => 
      card.id === id ? { ...card, color } : card
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
      color: newColor,
      current: 0,
      target,
      history: [],
    }

    setScorecards(prev => [...prev, newScorecard])
    setNewArea("")
    setNewTarget("")
    setNewIcon(iconOptions[0])
    setNewColor(getDefaultScorecardColor(scorecards.length + 1))
    setAddExpanded(false)
  }

  const addAreaCard = addExpanded ? (
    <div className="scorecard add-scorecard-form-card" style={{ gridColumn: '1 / -1' }}>
      <div className="add-scorecard-form-header">
        <span className="add-scorecard-title">Add area</span>
        <button
          type="button"
          className="add-scorecard-close"
          onClick={() => setAddExpanded(false)}
          aria-label="Cancel"
        >
          <X size={20} />
        </button>
      </div>
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
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          aria-label="Scorecard color"
        />
        <button type="submit">Add</button>
      </form>
    </div>
  ) : (
    <button
      type="button"
      className="scorecard add-scorecard-button"
      style={{ gridColumn: '1 / -1' }}
      onClick={() => setAddExpanded(true)}
      aria-label="Add a new area"
    >
      <span className="add-scorecard-button-icon"><Plus size={32} /></span>
      <span className="add-scorecard-button-label">Add area</span>
    </button>
  )

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

      <div className="dashboard-content">
        <section className="scorecard-section">
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
                <span className="summary-value"><Flame size={24} /> {summary.currentStreak}d</span>
                <p className="summary-hint">best: {summary.bestStreak} days</p>
              </div>
            </section>
          )}
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
                  onColorChange={handleColorChange}
                  onAreaChange={handleAreaChange}
                  onTargetChange={handleTargetChange}
                  onDelete={handleDelete}
                  onLogDate={handleLogDate}
                  onRemoveDate={handleRemoveDate}
                />
              ))}
              {addAreaCard}
            </div>
          ) : addExpanded ? (
            <div className="scorecard-grid">{addAreaCard}</div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><Target size={40} /></div>
              <p>No areas yet.</p>
              <button
                type="button"
                className="add-scorecard-empty-button"
                onClick={() => setAddExpanded(true)}
                aria-label="Add a new area"
              >
                <span className="add-scorecard-button-icon"><Plus size={32} /></span>
              </button>
            </div>
          )}
        </section>

        <section className="calendar-section">
          <ChallengeCalendar
            startDate={challengeStart}
            onStartDateChange={setChallengeStartKey}
            totalDays={TOTAL_DAYS}
            scorecards={scorecards}
          />
        </section>
      </div>
    </div>
  )
}

export default Dashboard