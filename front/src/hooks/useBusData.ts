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
  currentLocation: string | null;
}

type UseBusDataReturn = {
  data: BusData[];
  isLoading: boolean;
  error: Error | undefined;
}

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

// バッチAPIの設定
// SWRは同じキーのリクエストをデデュプリケートするため、
// 両停留所のデータを1リクエストで取得できる
const BATCH_URL = `${import.meta.env.VITE_BACKEND_URL}/api/trips/batch`
const MAX_BUS_COUNT = 20
const BATCH_QUERIES = [
  { origin: '22030_2', destination: '51240_,10_', limit: MAX_BUS_COUNT }, // 市立大学前: 横川駅前経由(51240_) + 中広町経由直行(10_)
  { origin: '24140_1', destination: '51240_,10_', limit: MAX_BUS_COUNT }, // 沼田料金所前: 横川駅前経由(51240_) + 中広町経由直行(10_)
]

// 応答が返らないままの接続でポーリングが止まらないよう必ず打ち切る
const FETCH_TIMEOUT_MS = 10 * 1000

// 最後にデータ取得に成功した時刻（鮮度ウォッチドッグ用）
let lastSuccessAt = Date.now()

const batchFetcher = ([url, queries]: [string, typeof BATCH_QUERIES]) => {
  // AbortSignal.timeout は古いChromiumに無いことがあるため手動で組む
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(queries),
    signal: controller.signal,
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`batch API error: ${res.status}`)
      }
      return res.json() as Promise<BusService[][]>
    })
    .then(data => {
      lastSuccessAt = Date.now()
      return data
    })
    .finally(() => clearTimeout(timer))
}

// 鮮度ウォッチドッグ: 一定時間データ更新に成功していなければページごと再起動する。
// SWRの内部状態やネットワークスタックがどんな異常に陥っても、
// リロードで必ず初期状態からやり直せるようにするサイネージ向けの保険。
// （サーバー側が本当に落ちている場合は約10分間隔のリロードを繰り返すだけで、
//   PWAのキャッシュにより画面自体は表示され続ける）
const WATCHDOG_STALE_MS = 10 * 60 * 1000
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (Date.now() - lastSuccessAt > WATCHDOG_STALE_MS) {
      window.location.reload()
    }
  }, 60 * 1000)
}

// バッチ結果の指定インデックスを UseBusDataReturn に変換する共通フック
function useBatchSlice(index: number): UseBusDataReturn {
  const { data: batchData, error, isLoading } = useSWR<BusService[][]>(
    [BATCH_URL, BATCH_QUERIES],
    batchFetcher,
    {
      refreshInterval: 15 * 1000, // 15秒ごとに更新
      revalidateOnFocus: false,
      // サイネージは常時表示前提: タブ非表示・オフライン判定でポーリングを
      // 止めるSWRの既定動作を無効化する（画面ブランクや一時的な回線断で
      // 更新が止まったまま復帰しない事故を防ぐ）
      refreshWhenHidden: true,
      refreshWhenOffline: true,
    }
  )

  const rawData = batchData?.[index]

  // 毎秒現在時刻を更新（残り時間の計算用）
  const [currentTime, setCurrentTime] = useState<Date>(() => getJapanDate())

  useEffect(() => {
    setCurrentTime(getJapanDate())
    const interval = setInterval(() => {
      setCurrentTime(getJapanDate())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // 残り時間を計算（発車済みのバスは除外、最大件数まで返す）
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
          currentLocation: bus.current_location,
        }
      })
      .filter(bus => bus.remainingSeconds >= 0)
      .sort((a, b) => a.remainingSeconds - b.remainingSeconds)
      .slice(0, MAX_BUS_COUNT)
  }, [rawData, currentTime])

  return { data, isLoading, error }
}

// 市立大学前 (22030_2) - バッチ結果の index 0
export function usePiroBusData(): UseBusDataReturn {
  return useBatchSlice(0)
}

// 沼田料金所前 (24140_1) - バッチ結果の index 1
export function useNumaBusData(): UseBusDataReturn {
  return useBatchSlice(1)
}
