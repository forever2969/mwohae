const DAY_KO = ['일', '월', '화', '수', '목', '금', '토']

export function formatDateTitle(date: Date, stationName: string): string {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  const day = DAY_KO[date.getDay()]
  return `${y}년 ${m}월 ${d}일 (${day}) - ${stationName} 데이트`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

export function getDaysBetween(from: string | Date, to: Date = new Date()): number {
  const start = typeof from === 'string' ? new Date(from) : from
  return Math.floor((to.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}
