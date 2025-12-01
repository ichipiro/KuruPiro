import useSWR from 'swr'
import { useState, useEffect, useMemo } from 'react'
import { BusService } from '../types/api'
import { getJapanDate } from './useJapanTime'

type BusData = {
  busId: string;
  destination: string;
  via: string;
  scheduledTime: string;
  delayedTime?: string;
  remainingMinutes: number;
}

type UseBusDataReturn = {
  data: BusData[];
  isLoading: boolean;
  error: Error | undefined;
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

// 経由を判定（trip_short_idで判断）
function getVia(tripShortId: string): string {
  // 60番台は中広町経由、それ以外は横川駅前経由
  if (tripShortId.startsWith('60')) {
    return '中広町経由'
  }
  return '横川駅前経由'
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

// 日本時間から残り時間（分）を計算
function calculateRemainingMinutes(targetTime: string, japanDate: Date): number {
  const [hours, minutes] = targetTime.split(':').map(Number)
  
  // 今日の目標時刻を作成
  const targetDate = new Date(japanDate)
  targetDate.setHours(hours, minutes, 0, 0)
  
  // 目標時刻が現在時刻より前の場合、翌日として扱う
  if (targetDate.getTime() < japanDate.getTime()) {
    targetDate.setDate(targetDate.getDate() + 1)
  }
  
  const diffMs = targetDate.getTime() - japanDate.getTime()
  return Math.max(0, Math.floor(diffMs / 1000 / 60))
}

export function useBusData(stopId: string): UseBusDataReturn {
  const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/${stopId}/51240_`
  
  const { data: rawData, error, isLoading } = useSWR<BusService[]>(
    apiUrl,
    fetcher,
    {
      refreshInterval: 30 * 1000, // 30秒ごとに更新
      revalidateOnFocus: false,
      dedupingInterval: 10 * 1000,
    }
  )

  // 毎秒現在時刻を更新（残り時間の計算用）
  const [currentTime, setCurrentTime] = useState<Date>(() => getJapanDate())
  
  useEffect(() => {
    // 初回更新
    setCurrentTime(getJapanDate())
    
    const interval = setInterval(() => {
      setCurrentTime(getJapanDate())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // 残り時間を日本時間から計算
  const data = useMemo(() => {
    if (!rawData) return []
    
    return rawData.map(bus => {
      const scheduledTime = bus.arrival_time.substring(0, 5) // "HH:MM"
      const delayMinutes = parseInt(bus.delay) || 0
      const delayedTime = calculateDelayedTime(scheduledTime, delayMinutes)
      
      // 遅延がある場合は遅延時刻から、ない場合は予定時刻から残り時間を計算
      const targetTime = delayedTime || scheduledTime
      const remainingMinutes = calculateRemainingMinutes(targetTime, currentTime)
      
      return {
        busId: bus.trip_short_id,
        destination: bus.trip_dest,
        via: getVia(bus.trip_short_id),
        scheduledTime,
        delayedTime,
        remainingMinutes,
      }
    })
  }, [rawData, currentTime])

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
