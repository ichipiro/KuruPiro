import { useState, useEffect } from 'react'

// グローバルなオフセット管理
let globalOffset = 0
const offsetListeners: Set<(offset: number) => void> = new Set()

/**
 * Dateヘッダは秒精度のため、リクエストごとに±1秒程度の揺れがある。
 * 表示時刻が毎回ブレないよう、このしきい値以上ズレたときだけ補正する。
 */
const OFFSET_UPDATE_THRESHOLD_MS = 2000

/**
 * APIレスポンスのDateヘッダから端末時計とのズレを補正する
 *
 * 以前は worldtimeapi.org（無料の外部サービスで長期障害の実績あり）に
 * 4.5時間ごとに問い合わせていたが、バス情報のポーリングで15秒ごとに
 * 受け取る自APIのレスポンスには必ず正確な Date ヘッダが付いてくるため、
 * それに相乗りする。外部依存と追加リクエストがなくなり、補正頻度も上がる。
 */
export function syncClockFromResponse(response: Response) {
  const dateHeader = response.headers.get('date')
  if (!dateHeader) return
  const serverTime = new Date(dateHeader).getTime()
  if (Number.isNaN(serverTime)) return

  const newOffset = serverTime - Date.now()
  if (Math.abs(newOffset - globalOffset) < OFFSET_UPDATE_THRESHOLD_MS) return

  globalOffset = newOffset
  // すべてのリスナーに通知
  offsetListeners.forEach(listener => listener(globalOffset))
}

if (typeof window !== 'undefined') {
  // 24時間ごとにページをリロード（メモリリーク対策）
  setTimeout(() => {
    window.location.reload()
  }, 24 * 60 * 60 * 1000)
}

// 日本時間のDateオブジェクトを取得
export function getJapanDate(): Date {
  return new Date(Date.now() + globalOffset)
}

// 日本時間のオフセットを取得
export function getJapanOffset(): number {
  return globalOffset
}

export function useJapanTime() {
  const [currentTime, setCurrentTime] = useState<string>('--:--')
  const [, setOffset] = useState<number>(globalOffset)

  // オフセットの変更を購読
  useEffect(() => {
    const listener = (newOffset: number) => setOffset(newOffset)
    offsetListeners.add(listener)
    return () => { offsetListeners.delete(listener) }
  }, [])

  // 毎秒時刻を更新
  useEffect(() => {
    const updateTime = () => {
      const now = getJapanDate()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      setCurrentTime(`${hours}:${minutes}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return currentTime
}
