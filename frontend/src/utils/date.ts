export const MS_PER_DAY = 86_400_000

export const formatDateLocal = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const startOfDay = (d: Date) => {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export const todayKey = () => formatDateLocal(new Date())

export const daysBetween = (from: Date, to: Date) => {
  return Math.floor((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_PER_DAY)
}

/**
 * Longest run of consecutive logged days ending today or yesterday (a "live" streak).
 * A streak that hasn't been logged today or yesterday is considered broken (0).
 */
export const computeCurrentStreak = (history: string[]) => {
  if (history.length === 0) return 0
  const logged = new Set(history)
  const today = startOfDay(new Date())
  const cursor = new Date(today)

  if (!logged.has(formatDateLocal(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!logged.has(formatDateLocal(cursor))) return 0
  }

  let streak = 0
  while (logged.has(formatDateLocal(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export const computeBestStreak = (history: string[]) => {
  if (history.length === 0) return 0
  const uniqueDays = Array.from(new Set(history)).sort()
  let best = 1
  let current = 1
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1])
    const curr = new Date(uniqueDays[i])
    if (daysBetween(prev, curr) === 1) {
      current += 1
      best = Math.max(best, current)
    } else {
      current = 1
    }
  }
  return best
}
