import { useMemo, useState } from "react";
import { Settings, X } from "lucide-react";
import type { ScorecardData } from "../scorecard/Scorecard";
import { MS_PER_DAY, formatDateLocal as formatDate } from "../../utils/date";
import { getDefaultScorecardColor } from "../../utils/colors";

interface ChallengeCalendarProps {
  startDate: Date
  onStartDateChange: (key: string) => void
  totalDays?: number
  scorecards: ScorecardData[]
  onDateSelect: (dateKey: string) => void
}

const ChallengeCalendar = ({ startDate, onStartDateChange, totalDays = 90, scorecards, onDateSelect }: ChallengeCalendarProps) => {
  const logCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    scorecards.forEach(card => {
      card.activities.forEach(activity => {
        const dateKey = formatDate(new Date(activity.loggedAt))
        counts[dateKey] = (counts[dateKey] || 0) + 1
      })
    })
    return counts
  }, [scorecards])

  const streamsByDate = useMemo(() => {
    const colors: Record<string, string[]> = {}
    const labels: Record<string, string[]> = {}
    scorecards.forEach((card, index) => {
      const color = card.color || getDefaultScorecardColor(index)
      const seen = new Set<string>()
      card.activities.forEach(activity => {
        const dateKey = formatDate(new Date(activity.loggedAt))
        if (seen.has(dateKey)) return
        seen.add(dateKey)
        if (!colors[dateKey]) {
          colors[dateKey] = []
          labels[dateKey] = []
        }
        colors[dateKey].push(color)
        labels[dateKey].push(card.area)
      })
    })
    return { colors, labels }
  }, [scorecards])

  const [settingsOpen, setSettingsOpen] = useState(false)

  const cells = useMemo(() => {
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)

    const endDate = new Date(start)
    endDate.setDate(start.getDate() + totalDays - 1)

    const startOfGrid = new Date(start)
    startOfGrid.setDate(start.getDate() - ((start.getDay() + 6) % 7))

    const endOfGrid = new Date(endDate)
    endOfGrid.setDate(endDate.getDate() + ((7 - endDate.getDay()) % 7))

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const result: {
      date: Date
      dateKey: string
      dayNumber: number | null
      count: number
      isInRange: boolean
      isToday: boolean
      isFuture: boolean
    }[] = []

    const current = new Date(startOfGrid)
    while (current <= endOfGrid) {
      const dateKey = formatDate(current)
      const isInRange = current >= start && current <= endDate
      const isToday = current.getTime() === today.getTime()
      const isFuture = current.getTime() > today.getTime()
      const dayNumber = isInRange
        ? Math.floor((current.getTime() - start.getTime()) / MS_PER_DAY) + 1
        : null

      result.push({
        date: new Date(current),
        dateKey,
        dayNumber,
        count: logCounts[dateKey] || 0,
        isInRange,
        isToday,
        isFuture,
      })
      current.setDate(current.getDate() + 1)
    }

    return result
  }, [startDate, totalDays, logCounts])

  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const activeDays = useMemo(() => cells.filter(c => c.isInRange && c.count > 0).length, [cells])
  const longestStreak = useMemo(() => {
    let max = 0
    let current = 0
    cells.forEach(c => {
      if (c.isInRange && c.count > 0) {
        current += 1
        max = Math.max(max, current)
      } else {
        current = 0
      }
    })
    return max
  }, [cells])

  return (
    <div className="challenge-calendar">
      <div className="calendar-header">
        <h3>90-Day Challenge</h3>
        <div className="calendar-meta-row">
          <p className="calendar-subtitle">
            {activeDays} active {activeDays === 1 ? "day" : "days"} · longest streak {longestStreak} {longestStreak === 1 ? "day" : "days"}
          </p>
          <div className="calendar-header-right">
          <div className="calendar-settings">
            <button
              type="button"
              className="calendar-settings-button"
              onClick={() => setSettingsOpen(open => !open)}
              aria-label="Challenge settings"
              aria-expanded={settingsOpen}
            >
              <Settings size={16} />
            </button>
            {settingsOpen && (
              <div className="calendar-settings-popover">
                <div className="calendar-settings-header">
                  <span>Start date</span>
                  <button
                    type="button"
                    className="calendar-settings-close"
                    onClick={() => setSettingsOpen(false)}
                    aria-label="Close settings"
                  >
                    <X size={14} />
                  </button>
                </div>
                <input
                  type="date"
                  value={formatDate(startDate)}
                  onChange={(e) => {
                    if (e.target.value) {
                      onStartDateChange(e.target.value)
                    }
                    setSettingsOpen(false)
                  }}
                />
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      <div className="calendar-weekdays">
        {weekdayLabels.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((cell, idx) => {
          const isMonthStart = cell.isInRange && cell.date.getDate() === 1
          const streamColors = streamsByDate.colors[cell.dateKey] || []
          const streamLabels = streamsByDate.labels[cell.dateKey] || []
          const title = cell.isInRange
            ? `${cell.dateKey} · Day ${cell.dayNumber!}${streamLabels.length ? " · " + streamLabels.join(", ") : ""} · ${cell.count} logged`
            : ""
          const ringRadius = 44
          const ringCircumference = 2 * Math.PI * ringRadius
          const ringSegmentLength = streamColors.length
            ? ringCircumference / streamColors.length
            : 0
          // Leave enough room for visibly separate rounded segment ends.
          const ringGapLength = streamColors.length
            ? ringCircumference * (Math.min(18, (360 / streamColors.length) * 0.4) / 360)
            : 0
          return (
            <div
              key={idx}
              role={cell.isInRange ? "button" : undefined}
              tabIndex={cell.isInRange ? 0 : undefined}
              onClick={() => cell.isInRange && onDateSelect(cell.dateKey)}
              onKeyDown={event => {
                if (cell.isInRange && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault()
                  onDateSelect(cell.dateKey)
                }
              }}
              className={`calendar-cell ${!cell.isInRange ? "outside" : cell.isFuture ? "future" : ""} ${cell.isToday && cell.isInRange ? "today" : ""}`}
              title={title}
            >
              {streamColors.length > 0 && (
                <svg className="activity-ring" viewBox="0 0 100 100" aria-hidden="true">
                  {streamColors.map((color, index) => (
                    <circle
                      key={`${color}-${index}`}
                      className="activity-ring-segment"
                      cx="50"
                      cy="50"
                      r={ringRadius}
                      pathLength="1"
                      stroke={color}
                      strokeDasharray={`${(ringSegmentLength - ringGapLength) / ringCircumference} 1`}
                      strokeDashoffset={-(index * ringSegmentLength) / ringCircumference}
                    />
                  ))}
                </svg>
              )}
              {cell.isInRange && (
                <>
                  {isMonthStart && (
                    <span className="cell-month">
                      {cell.date.toLocaleDateString(undefined, { month: "short" })}
                    </span>
                  )}
                  <span className="cell-day">{cell.date.getDate()}</span>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ChallengeCalendar
