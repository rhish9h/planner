import {
  Laptop,
  Puzzle,
  Palette,
  BookOpen,
  Dumbbell,
  Briefcase,
  Rocket,
  Flame,
  Star,
  Target,
  TrendingUp,
  Brain,
  Circle,
  type LucideIcon,
} from "lucide-react"

export const iconOptions = [
  "Laptop",
  "Puzzle",
  "Palette",
  "BookOpen",
  "Dumbbell",
  "Briefcase",
  "Rocket",
  "Flame",
  "Star",
  "Target",
  "TrendingUp",
  "Brain",
] as const

export type IconName = (typeof iconOptions)[number]

export const iconMap: Record<IconName, LucideIcon> = {
  Laptop,
  Puzzle,
  Palette,
  BookOpen,
  Dumbbell,
  Briefcase,
  Rocket,
  Flame,
  Star,
  Target,
  TrendingUp,
  Brain,
}

const legacyIconMap: Record<string, IconName> = {
  "\u{1F4BB}": "Laptop",
  "\u{1F9E9}": "Puzzle",
  "\u{1F3A8}": "Palette",
  "\u{1F4DA}": "BookOpen",
  "\u{1F3CB}": "Dumbbell",
  "\u{1F4BC}": "Briefcase",
  "\u{1F680}": "Rocket",
  "\u{1F525}": "Flame",
  "\u{2B50}": "Star",
  "\u{1F3AF}": "Target",
  "\u{1F4C8}": "TrendingUp",
  "\u{1F9E0}": "Brain",
}

export const getAreaIcon = (name: string) => iconMap[name as IconName] || Circle

export const migrateIcon = (icon: string): IconName => {
  if (iconMap[icon as IconName]) return icon as IconName
  const normalized = icon.replace(/\uFE0F/g, "")
  return legacyIconMap[normalized] || (iconOptions[0] as IconName)
}
