import useSWR from 'swr'
import { useState, useEffect, useMemo } from 'react'
import { BusService } from '../types/api'
import { getJapanDate } from './useJapanTime'

type BusData = {
  busId: string;
  tripId: string;
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
//   奇数(61, 63, 65): 横川駅前経由
//   偶数(60, 62, 64): 中広町経由
function getVia(tripShortId: string): string {
  const busNumber = parseInt(tripShortId.substring(0, 2))
  if (busNumber % 2 === 1) {
    return '横川駅前経由'
  }
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

  const targetDate = new Date(japanDate)
  targetDate.setHours(hours, minutes, 0, 0)

  const diffMs = targetDate.getTime() - japanDate.getTime()

  if (diffMs < 0) {
    return -1
  }

  return Math.floor(diffMs / 1000)
}

export function useBusData(stopId: string, destinations: string = '51240_'): UseBusDataReturn {
  // response_size=6で6本取得し、表示は4本に制限（余裕を持たせる）
  // destinations: カンマ区切りで複数の目的地を指定可能 (例: '51240_,10_')
  const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/${stopId}/${destinations}?response_size=6`

  const { data: rawData, error, isLoading } = useSWR<BusService[]>(
    apiUrl,
    fetcher,
    {
      refreshInterval: 30 * 1000, // 30秒ごとに更新
      revalidateOnFocus: false,
    }
  )

  // 毎秒現在時刻を更新（残り時間の計算用）
  const [currentTime, setCurrentTime] = useState<Date>(() => getJapanDate())

  useEffect(() => {
    setCurrentTime(getJapanDate())
    const interval = setInterval(() => {
      setCurrentTime(getJapanDate())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // 残り時間を計算（発車済みのバスは除外、5本に制限）
  const data = useMemo(() => {
    if (!rawData || rawData.length === 0) return []

    return rawData
      .map(bus => {
        const scheduledTime = bus.arrival_time.substring(0, 5)
        const delayMinutes = parseInt(bus.delay) || 0
        const delayedTime = calculateDelayedTime(scheduledTime, delayMinutes)
        const targetTime = delayedTime || scheduledTime
        const remainingSeconds = calculateRemainingSeconds(targetTime, currentTime)

        return {
          busId: bus.trip_short_id,
          tripId: bus.trip_id,
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
  }, [rawData, currentTime])

  return {
    data,
    isLoading,
    error,
  }
}

// 市立大学前 (22030_2)
// 横川駅前経由(51240_) と 中広町経由バスセンター直行(10_) の両方
export function usePiroBusData(): UseBusDataReturn {
  return useBusData('22030_2', '51240_,10_')
}

// 沼田料金所前 (24140_1)
// 横川駅前経由(51240_) と 中広町経由バスセンター直行(10_) の両方
export function useNumaBusData(): UseBusDataReturn {
  return useBusData('24140_1', '51240_,10_')
}
