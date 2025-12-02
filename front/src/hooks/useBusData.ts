import useSWR from 'swr'
import { useState, useEffect, useMemo, useRef } from 'react'
import { BusService } from '../types/api'
import { getJapanDate } from './useJapanTime'

type BusData = {
  busId: string;
  destination: string;
  via: string;
  scheduledTime: string;
  delayedTime?: string;
  remainingSeconds: number;
}

type UseBusDataReturn = {
  data: BusData[];
  isLoading: boolean;
  error: Error | undefined;
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

// 経由を判定（trip_short_idで判断）
// 西風新都線エリアのバス番号:
//   中広町経由: 60, 61, 62, 64, 65
//   横川駅経由: 63
function getVia(tripShortId: string): string {
  // 63番は横川駅前経由
  if (tripShortId.startsWith('63')) {
    return '横川駅前経由'
  }
  // それ以外の60番台（60, 61, 62, 64, 65）は中広町経由
  return '中広町経由'
}

// 遅延時刻を計算
function calculateDelayedTime(scheduledTime: string, delayMinutes: number): string | undefined {
  if (delayMinutes <= 0) return undefined

  const [hours, minutes] = scheduledTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + delayMinutes
  const newHours = Math.floor(totalMinutes / 60) % 24
  const newMinutes = totalMinutes % 60

  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
}

// 日本時間から残り時間（秒）を計算（過ぎた場合は-1を返す）
function calculateRemainingSeconds(targetTime: string, japanDate: Date): number {
  const [hours, minutes] = targetTime.split(':').map(Number)

  // 今日の目標時刻を作成
  const targetDate = new Date(japanDate)
  targetDate.setHours(hours, minutes, 0, 0)

  const diffMs = targetDate.getTime() - japanDate.getTime()

  // 発車時刻を過ぎた場合は-1を返す
  if (diffMs < 0) {
    return -1
  }

  return Math.floor(diffMs / 1000)
}

export function useBusData(stopId: string): UseBusDataReturn {
  // response_size=6で6本取得し、表示は5本に制限（余裕を持たせる）
  const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/${stopId}/51240_?response_size=6`

  const { data: rawData, error, isLoading, mutate } = useSWR<BusService[]>(
    apiUrl,
    fetcher,
    {
      refreshInterval: 30 * 1000, // 30秒ごとに更新
      revalidateOnFocus: false,
      dedupingInterval: 0, // 重複リクエスト防止を無効化
    }
  )

  // 毎秒現在時刻を更新（残り時間の計算用）
  const [currentTime, setCurrentTime] = useState<Date>(() => getJapanDate())

  // 前回のAPIデータをキャッシュ（補完用）
  const [cachedRawData, setCachedRawData] = useState<BusService[]>([])
  // 前回のrawDataを追跡
  const prevRawDataRef = useRef<BusService[] | undefined>(undefined)
  // APIから取得した時点でのバス数（フィルタ前）
  const rawBusCountRef = useRef(0)

  useEffect(() => {
    setCurrentTime(getJapanDate())
    const interval = setInterval(() => {
      setCurrentTime(getJapanDate())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // rawDataが変わったらキャッシュを更新
  useEffect(() => {
    if (rawData && rawData !== prevRawDataRef.current) {
      prevRawDataRef.current = rawData
      rawBusCountRef.current = rawData.length
      setCachedRawData(prev => {
        const existingIds = new Set(rawData.map(b => `${b.arrival_time}-${b.trip_short_id}`))
        const additionalBuses = prev.filter(
          b => !existingIds.has(`${b.arrival_time}-${b.trip_short_id}`)
        )
        return [...rawData, ...additionalBuses]
      })
    }
  }, [rawData])

  // 残り時間を日本時間から計算（発車済みのバスは除外）
  const data = useMemo(() => {
    const sourceData = cachedRawData.length > 0 ? cachedRawData : (rawData || [])
    if (sourceData.length === 0) return []

    return sourceData
      .map(bus => {
        const scheduledTime = bus.arrival_time.substring(0, 5)
        const delayMinutes = parseInt(bus.delay) || 0
        const delayedTime = calculateDelayedTime(scheduledTime, delayMinutes)
        const targetTime = delayedTime || scheduledTime
        const remainingSeconds = calculateRemainingSeconds(targetTime, currentTime)

        return {
          busId: bus.trip_short_id,
          destination: bus.trip_dest,
          via: getVia(bus.trip_short_id),
          scheduledTime,
          delayedTime,
          remainingSeconds,
        }
      })
      .filter(bus => bus.remainingSeconds >= 0)
      .sort((a, b) => a.remainingSeconds - b.remainingSeconds)
      .slice(0, 5)
  }, [cachedRawData, rawData, currentTime])

  // 表示中のバスが5本未満なら即座に再取得（レンダリング中にチェック）
  if (data.length < 5 && rawBusCountRef.current >= 5) {
    // 非同期で mutate を呼ぶ（レンダリング中の state 更新を避ける）
    setTimeout(() => mutate(), 0)
  }

  return {
    data,
    isLoading,
    error,
  }
}

// 市立大学前 (22030_2)
export function usePiroBusData(): UseBusDataReturn {
  return useBusData('22030_2')
}

// 沼田料金所前 (24140_1)
export function useNumaBusData(): UseBusDataReturn {
  return useBusData('24140_1')
}
