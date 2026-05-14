export async function sendPushNotification(payload: {
  targetUserId: string
  title: string
  body: string
  url?: string
}) {
  try {
    await fetch('/api/push/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // 알림 실패는 무시
  }
}
