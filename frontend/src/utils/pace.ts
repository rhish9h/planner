export type PaceClass = "complete" | "ahead" | "on-pace" | "behind" | "attention" | "upcoming" | "starting"

export interface Pace {
  label: string
  className: PaceClass
}

export const computePace = (current: number, target: number, daysElapsed: number, totalDays: number): Pace => {
  if (target > 0 && current >= target) {
    return { label: "Completed", className: "complete" }
  }

  if (daysElapsed <= 0) {
    return { label: "Starts soon", className: "upcoming" }
  }

  // The first few days do not provide enough signal for a useful pace call.
  // Avoid implying that an untouched goal is already performing well.
  if (daysElapsed <= 3) {
    return { label: "Getting started", className: "starting" }
  }

  const actualPct = target > 0 ? (current / target) * 100 : 0
  const expectedPct = Math.min(100, (daysElapsed / totalDays) * 100)
  const delta = actualPct - expectedPct

  if (delta >= 15) return { label: "Ahead of pace", className: "ahead" }
  if (delta >= -10) return { label: "On pace", className: "on-pace" }
  if (delta >= -30) return { label: "Slightly behind", className: "behind" }
  return { label: "Needs attention", className: "attention" }
}
