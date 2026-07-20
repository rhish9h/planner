import { useEffect, useMemo, useRef, useState, type SetStateAction } from "react";
import { Plus, X, Target, Flame } from "lucide-react";
import Scorecard, { type ScorecardData } from "../scorecard/Scorecard";
import ChallengeCalendar from "../calendar/ChallengeCalendar";
import IconPicker from "../iconPicker/IconPicker";
import LogActivityModal from "../activity/LogActivityModal";
import ActivityHistoryModal from "../activity/ActivityHistoryModal";
import DayActivitiesModal from "../activity/DayActivitiesModal";
import { iconOptions, migrateIcon } from "../iconPicker/iconOptions";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { computeCurrentStreak, computeBestStreak, daysBetween, todayKey } from "../../utils/date";
import { computePace } from "../../utils/pace";
import { getDefaultScorecardColor } from "../../utils/colors";

const TOTAL_DAYS = 90

const initialData: ScorecardData[] = [
  { id: "1", area: "Leetcode", icon: "Laptop", color: getDefaultScorecardColor(0), startingCount: 9, target: 150, activities: [] },
  { id: "2", area: "System Design", icon: "Puzzle", color: getDefaultScorecardColor(1), startingCount: 0, target: 90, activities: [] },
  { id: "3", area: "Low Level Design", icon: "Palette", color: getDefaultScorecardColor(2), startingCount: 0, target: 60, activities: [] },
  { id: "4", area: "Cyclo Veda", icon: "BookOpen", color: getDefaultScorecardColor(3), startingCount: 0, target: 120, activities: [] },
  { id: "5", area: "Fitness", icon: "Dumbbell", color: getDefaultScorecardColor(4), startingCount: 0, target: 90, activities: [] },
  { id: "6", area: "Job Applications", icon: "Briefcase", color: getDefaultScorecardColor(5), startingCount: 0, target: 50, activities: [] },
]

type LegacyScorecard = Omit<ScorecardData, "startingCount" | "activities"> & {
  current?: number
  history?: string[]
  startingCount?: number
  activities?: ScorecardData["activities"]
}

interface LoggingContext {
  areaId?: string
  dateKey: string
}

const normalizeScorecards = (cards: Array<ScorecardData | LegacyScorecard>): ScorecardData[] => cards.map((card, index) => {
  const legacyCard = card as LegacyScorecard
  const activities = Array.isArray(legacyCard.activities)
    ? legacyCard.activities
    : (legacyCard.history ?? []).map((dateKey, activityIndex) => ({
        id: `migrated-${legacyCard.id}-${activityIndex}`,
        loggedAt: `${dateKey}T12:00:00`,
      }))
  const startingCount = legacyCard.startingCount ?? Math.max(0, (legacyCard.current ?? 0) - activities.length)
  return {
    id: legacyCard.id,
    area: legacyCard.area,
    icon: migrateIcon(legacyCard.icon),
    color: legacyCard.color ?? getDefaultScorecardColor(index),
    target: legacyCard.target,
    startingCount,
    activities,
  }
})

const Dashboard = () => {
  const [storedScorecards, setStoredScorecards] = useLocalStorage<Array<ScorecardData | LegacyScorecard>>("tracker.scorecards", initialData)
  const scorecards = useMemo(() => normalizeScorecards(storedScorecards), [storedScorecards])
  const setScorecards = (update: SetStateAction<ScorecardData[]>) => {
    setStoredScorecards(previous => {
      const normalized = normalizeScorecards(previous)
      return typeof update === "function" ? update(normalized) : update
    })
  }
  const migratedRef = useRef(false)
  const [newArea, setNewArea] = useState("")
  const [newTarget, setNewTarget] = useState("")
  const [newIcon, setNewIcon] = useState<string>(iconOptions[0])
  const [newColor, setNewColor] = useState<string>(() => getDefaultScorecardColor(scorecards.length))
  const [loggingContext, setLoggingContext] = useState<LoggingContext | null>(null)
  const [historyAreaId, setHistoryAreaId] = useState<string | null>(null)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)

  useEffect(() => {
    if (migratedRef.current) return
    migratedRef.current = true
    const migrated = normalizeScorecards(storedScorecards)
    if (JSON.stringify(migrated) !== JSON.stringify(storedScorecards)) {
      setStoredScorecards(migrated)
    }
  }, [storedScorecards, setStoredScorecards])
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
          scorecards.reduce((sum, card) => {
            const current = card.startingCount + card.activities.length
            return sum + Math.min(100, card.target > 0 ? (current / card.target) * 100 : 0)
          }, 0) / totalGoals
        )

    const onPaceCount = scorecards.filter(card => {
      const { className } = computePace(card.startingCount + card.activities.length, card.target, daysElapsed, TOTAL_DAYS)
      return className === "complete" || className === "ahead" || className === "on-pace" || className === "starting"
    }).length

    const allHistoryDays = Array.from(new Set(scorecards.flatMap(card => card.activities.map(activity => todayKey(new Date(activity.loggedAt))))))
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
      card.id === id ? { ...card, target } : card
    ))
  }

  const handleLogActivity = (areaId: string, description: string, url: string, dateKey: string) => {
    setScorecards(prev => prev.map(card =>
      card.id === areaId ? {
        ...card,
        activities: [...card.activities, { id: crypto.randomUUID(), loggedAt: new Date(`${dateKey}T12:00:00`).toISOString(), ...(description && { description }), ...(url && { url }) }],
      } : card
    ))
    setLoggingContext(null)
  }

  const handleDeleteActivity = (id: string) => {
    if (!historyAreaId) return
    setScorecards(prev => prev.map(card => {
      if (card.id !== historyAreaId) return card
      return { ...card, activities: card.activities.filter(activity => activity.id !== id) }
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
      target,
      startingCount: 0,
      activities: [],
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
                <p className="summary-hint">best: {summary.bestStreak} day{summary.bestStreak === 1 ? "" : "s"}</p>
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
                  onIconChange={handleIconChange}
                  onColorChange={handleColorChange}
                  onAreaChange={handleAreaChange}
                  onTargetChange={handleTargetChange}
                  onDelete={handleDelete}
                  onLogActivity={areaId => setLoggingContext({ areaId, dateKey: todayKey() })}
                  onViewHistory={setHistoryAreaId}
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
                <span className="add-scorecard-button-label">Add area</span>
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
            onDateSelect={setSelectedCalendarDate}
          />
        </section>
      </div>
      {loggingContext && <LogActivityModal
        areas={scorecards.map(card => ({ id: card.id, name: card.area }))}
        initialAreaId={loggingContext.areaId}
        initialDate={loggingContext.dateKey}
        onClose={() => setLoggingContext(null)}
        onSubmit={handleLogActivity}
      />}
      {historyAreaId && (() => {
        const area = scorecards.find(card => card.id === historyAreaId)
        return area ? <ActivityHistoryModal areaName={area.area} activities={[...area.activities].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt))} onClose={() => setHistoryAreaId(null)} onDelete={handleDeleteActivity} /> : null
      })()}
      {selectedCalendarDate && <DayActivitiesModal dateKey={selectedCalendarDate} scorecards={scorecards} onClose={() => setSelectedCalendarDate(null)} onLogActivity={dateKey => {
        setSelectedCalendarDate(null)
        setLoggingContext({ dateKey })
      }} />}
    </div>
  )
}

export default Dashboard
