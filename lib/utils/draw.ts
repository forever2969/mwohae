import { drawLine, drawDirection, drawStationIndex, drawStationName, drawLunch, drawDessert, drawActivity, drawDinner } from './random'
import { formatDateTitle } from './date'
import { SUBWAY_LINES } from '../data/subway'
import { LUNCH_OPTIONS, DINNER_OPTIONS, DESSERT_OPTIONS } from '../data/food'
import { ACTIVITY_OPTIONS } from '../data/activities'
import type { DateSession, Couple } from '@/types'

export interface DrawResult {
  updates: Record<string, unknown>
  displayValue: string
  slotItems: string[]
}

export function calculateDraw(session: DateSession, couple: Couple): DrawResult | null {
  const { requester_id: requesterId, receiver_id: receiverId } = couple

  switch (session.current_step) {
    case 0: {
      const line = drawLine()
      const lineData = SUBWAY_LINES.find((l) => l.line === line)
      return {
        updates: { line, current_step: 1, current_turn: receiverId },
        displayValue: `${line}호선`,
        slotItems: SUBWAY_LINES.map((l) => `${l.line}호선`),
      }
    }
    case 1: {
      const direction = drawDirection()
      return {
        updates: { direction, current_step: 2, current_turn: requesterId },
        displayValue: direction === 'left' ? '왼쪽 방향' : '오른쪽 방향',
        slotItems: ['왼쪽 방향', '오른쪽 방향'],
      }
    }
    case 2: {
      const idx = drawStationIndex(session.line!)
      const name = drawStationName(session.line!, idx, session.direction! as 'left' | 'right')
      const lineData = SUBWAY_LINES.find((l) => l.line === session.line)
      return {
        updates: { station_index: idx, station_name: name, current_step: 3, current_turn: requesterId },
        displayValue: `${name}역`,
        slotItems: lineData ? lineData.stations.map((s) => `${s}역`) : [`${name}역`],
      }
    }
    case 3: {
      return {
        updates: { current_step: 4, current_turn: receiverId },
        displayValue: '',
        slotItems: [],
      }
    }
    case 4: {
      const lunch = drawLunch()
      return {
        updates: { lunch, current_step: 5, current_turn: requesterId },
        displayValue: lunch,
        slotItems: LUNCH_OPTIONS,
      }
    }
    case 5: {
      const dessert = drawDessert()
      return {
        updates: { dessert, current_step: 6, current_turn: receiverId },
        displayValue: dessert,
        slotItems: DESSERT_OPTIONS,
      }
    }
    case 6: {
      const activity = drawActivity()
      return {
        updates: { activity, current_step: 7, current_turn: requesterId },
        displayValue: activity,
        slotItems: ACTIVITY_OPTIONS,
      }
    }
    case 7: {
      const dinner = drawDinner()
      const title = formatDateTitle(new Date(session.date), session.station_name!)
      return {
        updates: {
          dinner,
          title,
          current_step: 8,
          current_turn: null,
          status: 'completed',
          completed_at: new Date().toISOString(),
        },
        displayValue: dinner,
        slotItems: DINNER_OPTIONS,
      }
    }
    default:
      return null
  }
}
