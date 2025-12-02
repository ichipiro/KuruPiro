import { useState, useEffect } from 'react'
import AnimatedBusList from '../components/signage/AnimatedBusList'
import BusColumn from '../components/signage/Bus-column'
import Sidebar from '../components/signage/Sidebar'
import { useJapanTime } from '../hooks/useJapanTime'
import { useWeather } from '../hooks/useWeather'
import { usePiroBusData, useNumaBusData } from '../hooks/useBusData'
import '../css/signage.css'

// 画面高さに応じて表示便数を計算
function useDisplayCount() {
  const [count, setCount] = useState(4)

  useEffect(() => {
    const updateCount = () => {
      const vh = window.innerHeight
      // メインカード(10.9vw) + リストカード(6.25vw) * n + ヘッダー等の余白
      // 大まかな目安: 800px以下=4便, 900px=5便, 1000px以上=6便
      if (vh >= 1000) {
        setCount(6)
      } else if (vh >= 850) {
        setCount(5)
      } else {
        setCount(4)
      }
    }

    updateCount()
    window.addEventListener('resize', updateCount)
    return () => window.removeEventListener('resize', updateCount)
  }, [])

  return count
}

export default function Signage() {
  const currentTime = useJapanTime()
  const weather = useWeather()
  const { data: piroData, isLoading: piroLoading } = usePiroBusData()
  const { data: numaData, isLoading: numaLoading } = useNumaBusData()
  const displayCount = useDisplayCount()

  // おすすめロジック:
  // - 沼田1便目が市大に来ない → 沼田をおすすめ（市大はおすすめなし）
  // - 沼田1便目が市大に来る → 市大をおすすめ（沼田はおすすめなし）
  const { numaRecommendedIndex, piroRecommendedIndex } = (() => {
    if (piroData.length === 0 || numaData.length === 0) {
      return { numaRecommendedIndex: -1, piroRecommendedIndex: 0 }
    }

    // 市大に来るバスのセット（trip_id で識別）
    const piroBusSet = new Set(piroData.map(bus => bus.tripId))

    // 沼田1便目が市大に来るかチェック
    const numaBus = numaData[0]
    const comesToPiro = piroBusSet.has(numaBus.tripId)

    if (comesToPiro) {
      // 沼田が市大に来る → 市大をおすすめ
      return { numaRecommendedIndex: -1, piroRecommendedIndex: 0 }
    } else {
      // 沼田が市大に来ない → 沼田をおすすめ
      return { numaRecommendedIndex: 0, piroRecommendedIndex: -1 }
    }
  })()

  return (
    <div className="bg-[#005394] h-screen overflow-y-hidden flex gap-[0.625vw]">
      {/* 左サイドバー */}
      <div className="flex-1 min-w-0">
        <Sidebar
          currentTime={currentTime}
          temperature={weather.temperature}
          weatherIcon={weather.icon}
        />
      </div>

      {/* バス情報エリア */}
      <div className="py-[0.9375vw] pr-[1.67vw] flex justify-center gap-[0.625vw] flex-[2] h-full">
        {/* 左カラム: 沼田料金所前 */}
        <div className="flex-1 min-w-0 h-full">
          <BusColumn stopName="沼田料金所前">
            {numaLoading ? (
              <div className="text-white text-center">読み込み中...</div>
            ) : (
              <AnimatedBusList buses={numaData} displayCount={displayCount} recommendedIndex={numaRecommendedIndex} />
            )}
          </BusColumn>
        </div>

        {/* 右カラム: 市立大学前 */}
        <div className="flex-1 min-w-0 h-full">
          <BusColumn stopName="市立大学前">
            {piroLoading ? (
              <div className="text-white text-center">読み込み中...</div>
            ) : (
              <AnimatedBusList buses={piroData} displayCount={displayCount} recommendedIndex={piroRecommendedIndex} />
            )}
          </BusColumn>
        </div>
      </div>
    </div>
  )
}