export const defaultScorecardColors = [
  "#4f46e5",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#84cc16",
]

export const getDefaultScorecardColor = (index: number) =>
  defaultScorecardColors[index % defaultScorecardColors.length]
