import { useMemo } from "react";
import type { ScorecardData } from "../scorecard/Scorecard";

interface ChallengeCalendarProps {
  startDate: Date
  totalDays?: number
  scorecards: ScorecardData[]
}

const MS_PER_DAY = 86_400_000

const formatDate = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const ChallengeCalendar = ({ startDate, totalDays = 90, scorecards }: ChallengeCalendarProps) => {
  const logCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    scorecards.forEach(card => {
      card.history.forEach(dateKey => {
        counts[dateKey] = (counts[dateKey] || 0) + 1
      })
    })
    return counts
  }, [scorecards])

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

  const getHeatClass = (count: number, isFuture: boolean, isInRange: boolean) => {
    if (!isInRange) return "outside"
    if (isFuture) return "future"
    if (count === 0) return "empty"
    if (count === 1) return "level-1"
    if (count <= 3) return "level-2"
    return "level-3"
  }

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
        <div>
          <h3>90-Day Challenge</h3>
          <p className="calendar-subtitle">
            {activeDays} active days · longest streak {longestStreak}
          </p>
        </div>
        <div className="calendar-legend">
          <span className="legend-item"><span className="legend-swatch outside" /> Rest</span>
          <span className="legend-item"><span className="legend-swatch empty" /> Missed</span>
          <span className="legend-item"><span className="legend-swatch level-1" /> 1</span>
          <span className="legend-item"><span className="legend-swatch level-2" /> 2–3</span>
          <span className="legend-item"><span className="legend-swatch level-3" /> 4+</span>
          <span className="legend-item"><span className="legend-swatch today" /> Today</span>
        </div>
      </div>

      <div className="calendar-weekdays">
        {weekdayLabels.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((cell, idx) => (
          <div
            key={idx}
            className={`calendar-cell ${getHeatClass(cell.count, cell.isFuture, cell.isInRange)} ${cell.isToday ? "today" : ""}`}
            title={cell.dayNumber ? `Day ${cell.dayNumber} · ${cell.dateKey} · ${cell.count} logged` : ""}
          >
            {cell.dayNumber && <span className="cell-day">{cell.dayNumber}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChallengeCalendar
