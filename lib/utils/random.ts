import { SUBWAY_LINES, getStation } from '@/lib/data/subway'
import { LUNCH_OPTIONS, DINNER_OPTIONS, DESSERT_OPTIONS } from '@/lib/data/food'
import { ACTIVITY_OPTIONS } from '@/lib/data/activities'

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickRandomIndex(length: number): number {
  return Math.floor(Math.random() * length)
}

export function drawLine(): number {
  return pickRandom(SUBWAY_LINES).line
}

export function drawDirection(): 'left' | 'right' {
  return pickRandom(['left', 'right'] as const)
}

export function drawStationIndex(line: number): number {
  const lineData = SUBWAY_LINES.find((l) => l.line === line)
  if (!lineData) return 0
  return pickRandomIndex(lineData.stations.length)
}

export function drawStationName(line: number, index: number, direction: 'left' | 'right'): string {
  return getStation(line, index, direction) ?? ''
}

export function drawLunch(): string {
  return pickRandom(LUNCH_OPTIONS)
}

export function drawDessert(): string {
  return pickRandom(DESSERT_OPTIONS)
}

export function drawActivity(): string {
  return pickRandom(ACTIVITY_OPTIONS)
}

export function drawDinner(): string {
  return pickRandom(DINNER_OPTIONS)
}
