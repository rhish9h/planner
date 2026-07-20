import { useEffect, useMemo, useState } from "react";
import { Plus, X, Target, Flame } from "lucide-react";
import Scorecard, { type Activity, type ScorecardData } from "../scorecard/Scorecard";
import ChallengeCalendar from "../calendar/ChallengeCalendar";
import IconPicker from "../iconPicker/IconPicker";
import LogActivityModal from "../activity/LogActivityModal";
import ActivityHistoryModal from "../activity/ActivityHistoryModal";
import DayActivitiesModal from "../activity/DayActivitiesModal";
import EditActivityModal from "../activity/EditActivityModal";
import ConfirmDeleteModal from "../activity/ConfirmDeleteModal";
import { iconOptions } from "../iconPicker/iconOptions";
import { createActivity, createArea, deleteActivity, deleteArea, loadDashboard, toScorecards, updateActivity, updateArea, updateChallenge, type DashboardData } from "../../api/planner";
import { computeCurrentStreak, computeBestStreak, daysBetween, todayKey } from "../../utils/date";
import { computePace } from "../../utils/pace";
import { getDefaultScorecardColor } from "../../utils/colors";

const TOTAL_DAYS = 90

interface LoggingContext {
  areaId?: string
  dateKey: string
}

interface EditingActivityContext {
  areaId: string
  activity: Activity
}

type DeleteRequest =
  | { kind: "area", areaId: string, areaName: string }
  | { kind: "activity", areaId: string, activityId: string }

const Dashboard = () => {
  const [scorecards, setScorecards] = useState<ScorecardData[]>([])
  const [challenge, setChallenge] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newArea, setNewArea] = useState("")
  const [newTarget, setNewTarget] = useState("")
  const [newIcon, setNewIcon] = useState<string>(iconOptions[0])
  const [newColor, setNewColor] = useState<string>(getDefaultScorecardColor(0))
  const [loggingContext, setLoggingContext] = useState<LoggingContext | null>(null)
  const [historyAreaId, setHistoryAreaId] = useState<string | null>(null)
  const [editingActivity, setEditingActivity] = useState<EditingActivityContext | null>(null)
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest | null>(null)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)

  const [addExpanded, setAddExpanded] = useState(false)

  const refreshDashboard = async () => {
    setLoading(true)
    try {
      const dashboard = await loadDashboard()
      setChallenge(dashboard)
      setScorecards(toScorecards(dashboard.areas))
      setError(null)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load your planner")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void refreshDashboard() }, [])

  const runMutation = async (mutation: () => Promise<unknown>) => {
    try {
      await mutation()
      await refreshDashboard()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save your changes")
    }
  }

  const challengeStartKey = challenge?.start_date ?? todayKey()
  const totalDays = challenge?.duration_days ?? TOTAL_DAYS

  const challengeStart = useMemo(() => {
    const [y, m, d] = challengeStartKey.split("-").map(Number)
    return new Date(y, (m || 1) - 1, d || 1)
  }, [challengeStartKey])

  const daysElapsed = useMemo(() => {
    return Math.min(totalDays, Math.max(0, daysBetween(challengeStart, new Date()) + 1))
  }, [challengeStart, totalDays])

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
      const { className } = computePace(card.startingCount + card.activities.length, card.target, daysElapsed, totalDays)
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
      daysRemaining: Math.max(0, totalDays - daysElapsed),
    }
  }, [scorecards, daysElapsed, totalDays])

  const handleDelete = (id: string) => {
    const area = scorecards.find(card => card.id === id)
    if (area) setDeleteRequest({ kind: "area", areaId: id, areaName: area.area })
  }

  const handleIconChange = (id: string, icon: string) => void runMutation(() => updateArea(id, { icon }))

  const handleColorChange = (id: string, color: string) => void runMutation(() => updateArea(id, { color }))

  const handleAreaChange = (id: string, area: string) => void runMutation(() => updateArea(id, { name: area }))

  const handleTargetChange = (id: string, target: number) => { if (target > 0) void runMutation(() => updateArea(id, { target })) }

  const handleLogActivity = (areaId: string, description: string, url: string, dateKey: string) => {
    void runMutation(() => createActivity(areaId, { activity_date: dateKey, description: description || null, url: url || null }))
    setLoggingContext(null)
  }

  const handleDeleteActivity = (id: string) => {
    if (!historyAreaId) return
    setDeleteRequest({ kind: "activity", areaId: historyAreaId, activityId: id })
  }

  const confirmDelete = () => {
    if (!deleteRequest) return
    void runMutation(() => deleteRequest.kind === "area" ? deleteArea(deleteRequest.areaId) : deleteActivity(deleteRequest.activityId))
    setDeleteRequest(null)
  }

  const handleEditActivity = (activity: Activity, dateKey: string, description: string, url: string) => {
    if (!editingActivity) return
    void runMutation(() => updateActivity(activity.id, { activity_date: dateKey, description: description || null, url: url || null }))
    setEditingActivity(null)
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const target = parseInt(newTarget, 10)
    if (!newArea.trim() || !target || target <= 0) return

    if (!challenge) return
    void runMutation(() => createArea(challenge.id, { name: newArea.trim(), icon: newIcon, color: newColor, target, starting_count: 0 }))
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

  if (loading && !challenge) {
    return <div className="dashboard"><p className="empty-activity-state">Loading your planner…</p></div>
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>90-Day Challenge</h1>
          <p className="dashboard-subtitle">
            Day {daysElapsed} of {totalDays} · {summary.daysRemaining} days left — small daily reps compound into big results.
          </p>
        </div>
      </header>
      {error && <p className="empty-activity-state" role="alert">{error}</p>}

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
                  totalDays={totalDays}
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
            onStartDateChange={dateKey => { if (challenge) void runMutation(() => updateChallenge(challenge.id, { start_date: dateKey })) }}
            totalDays={totalDays}
            scorecards={scorecards}
            onDateSelect={setSelectedCalendarDate}
          />
        </section>
      </div>
      {loggingContext && <LogActivityModal
        areas={scorecards.map(card => ({ id: card.id, name: card.area }))}
        initialAreaId={loggingContext.areaId}
        initialDate={loggingContext.dateKey}
        minDate={challengeStartKey}
        maxDate={todayKey()}
        onClose={() => setLoggingContext(null)}
        onSubmit={handleLogActivity}
      />}
      {historyAreaId && (() => {
        const area = scorecards.find(card => card.id === historyAreaId)
        return area ? <ActivityHistoryModal areaName={area.area} activities={[...area.activities].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt))} onClose={() => setHistoryAreaId(null)} onDelete={handleDeleteActivity} onEdit={activity => {
          setHistoryAreaId(null)
          setEditingActivity({ areaId: area.id, activity })
        }} /> : null
      })()}
      {editingActivity && (() => {
        const area = scorecards.find(card => card.id === editingActivity.areaId)
        return area ? <EditActivityModal areaName={area.area} activity={editingActivity.activity} minDate={challengeStartKey} maxDate={todayKey()} onClose={() => setEditingActivity(null)} onSubmit={handleEditActivity} /> : null
      })()}
      {deleteRequest && <ConfirmDeleteModal
        title={deleteRequest.kind === "area" ? `Delete ${deleteRequest.areaName}?` : "Delete this activity?"}
        message={deleteRequest.kind === "area" ? "This will permanently remove the area and all of its activity history." : "This will permanently remove this activity from the area history and calendar."}
        onCancel={() => setDeleteRequest(null)}
        onConfirm={confirmDelete}
      />}
      {selectedCalendarDate && <DayActivitiesModal dateKey={selectedCalendarDate} scorecards={scorecards} onClose={() => setSelectedCalendarDate(null)} onLogActivity={dateKey => {
        setSelectedCalendarDate(null)
        setLoggingContext({ dateKey })
      }} />}
    </div>
  )
}

export default Dashboard
