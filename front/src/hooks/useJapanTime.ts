import { useState, useEffect } from 'react'

// グローバルなオフセット管理
let globalOffset = 0
let offsetInitialized = false
const offsetListeners: Set<(offset: number) => void> = new Set()

async function fetchAndSetOffset() {
  try {
    const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Tokyo')
    const data = await response.json()
    const serverTime = new Date(data.datetime).getTime()
    const localTime = Date.now()
    globalOffset = serverTime - localTime
    offsetInitialized = true
    // すべてのリスナーに通知
    offsetListeners.forEach(listener => listener(globalOffset))
  } catch (error) {
    console.error('NTPサーバーからの時刻取得に失敗:', error)
    offsetInitialized = true
  }
}

// 初回取得と定期的な同期（8:00-22:00の運用中に3回程度）
if (typeof window !== 'undefined') {
  fetchAndSetOffset()
  // 約4.5時間ごとに同期（14時間の運用で約3回）
  setInterval(fetchAndSetOffset, 4.5 * 60 * 60 * 1000)
  
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
