import type { Activity, ScorecardData } from "../components/scorecard/Scorecard"
import { getDefaultScorecardColor } from "../utils/colors"

const API_BASE = import.meta.env.VITE_API_URL ?? ""
const DEMO_EMAIL = "planner@local"

interface ApiActivity {
  id: string
  area_id: string
  activity_date: string
  description: string | null
  url: string | null
}

interface ApiArea {
  id: string
  name: string
  goal: string
  target: number
  starting_count: number
  icon: string
  color: string
  activities?: ApiActivity[]
}

export interface DashboardData {
  id: string
  start_date: string
  duration_days: number
  areas: ApiArea[]
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail ?? `Request failed (${response.status})`)
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}

const defaultAreas = [
  ["Leetcode", "Solve a Leetcode problem", "Laptop", 9, 150],
  ["System Design", "Solve a system design problem in an interactive ChatGPT session", "Puzzle", 0, 90],
  ["Low Level Design", "Solve a low-level design problem", "Palette", 0, 60],
  ["Cyclo Veda", "Build a feature for Cyclo Veda", "BookOpen", 0, 120],
  ["Fitness", "Exercise for 30 minutes", "Dumbbell", 0, 90],
  ["Job Applications", "Submit a job application", "Briefcase", 0, 50],
] as const

export const toScorecards = (areas: ApiArea[]): ScorecardData[] => areas.map((area, index) => ({
  id: area.id,
  area: area.name,
  goal: area.goal,
  icon: area.icon,
  color: area.color || getDefaultScorecardColor(index),
  target: area.target,
  startingCount: area.starting_count,
  activities: (area.activities ?? []).map((activity): Activity => ({
    id: activity.id,
    loggedAt: `${activity.activity_date}T12:00:00.000Z`,
    ...(activity.description ? { description: activity.description } : {}),
    ...(activity.url ? { url: activity.url } : {}),
  })),
}))

export async function loadDashboard(): Promise<DashboardData> {
  let user: { id: string }
  try {
    user = await request(`/v1/users?email=${encodeURIComponent(DEMO_EMAIL)}`)
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("not found")) throw error
    user = await request("/v1/users", { method: "POST", body: JSON.stringify({ email: DEMO_EMAIL }) })
  }

  try {
    return await request(`/v1/challenges/current?user_id=${user.id}`)
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("not found")) throw error
    const challenge = await request<{ id: string }>("/v1/challenges", {
      method: "POST",
      body: JSON.stringify({ user_id: user.id, start_date: new Date().toISOString().slice(0, 10) }),
    })
    await Promise.all(defaultAreas.map(([name, goal, icon, starting_count, target], index) => request(`/v1/challenges/${challenge.id}/areas`, {
      method: "POST",
      body: JSON.stringify({ name, goal, icon, starting_count, target, color: getDefaultScorecardColor(index) }),
    })))
    return request(`/v1/challenges/current?user_id=${user.id}`)
  }
}

export const updateChallenge = (id: string, values: { start_date: string }) => request(`/v1/challenges/${id}`, { method: "PATCH", body: JSON.stringify(values) })
export const createArea = (challengeId: string, values: object) => request(`/v1/challenges/${challengeId}/areas`, { method: "POST", body: JSON.stringify(values) })
export const updateArea = (id: string, values: object) => request(`/v1/areas/${id}`, { method: "PATCH", body: JSON.stringify(values) })
export const deleteArea = (id: string) => request<void>(`/v1/areas/${id}`, { method: "DELETE" })
export const createActivity = (areaId: string, values: object) => request(`/v1/areas/${areaId}/activities`, { method: "POST", body: JSON.stringify(values) })
export const updateActivity = (id: string, values: object) => request(`/v1/activities/${id}`, { method: "PATCH", body: JSON.stringify(values) })
export const deleteActivity = (id: string) => request<void>(`/v1/activities/${id}`, { method: "DELETE" })
