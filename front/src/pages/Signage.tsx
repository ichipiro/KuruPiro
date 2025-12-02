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

  // 沼田のおすすめ: 
  // 1. 市立大学前の1便目より前に発車する
  // 2. かつ、市大前に来ないバス（市大のリストに同じバスがない）
  const numaRecommendedIndex = (() => {
    if (piroData.length === 0 || numaData.length === 0) return -1

    // 市大に来るバスのセット（busId + scheduledTime で識別）
    const piroBusSet = new Set(piroData.map(bus => `${bus.busId}-${bus.scheduledTime}`))

    const piroFirstTime = piroData[0].remainingSeconds

    // 沼田1便目が市大1便目より前 かつ 市大に来ないバスならおすすめ
    const numaBus = numaData[0]
    const isBeforePiro = numaBus.remainingSeconds < piroFirstTime
    const comesToPiro = piroBusSet.has(`${numaBus.busId}-${numaBus.scheduledTime}`)

    if (isBeforePiro && !comesToPiro) {
      return 0
    }

    // そうでなければおすすめなし
    return -1
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
              <AnimatedBusList buses={piroData} displayCount={displayCount} />
            )}
          </BusColumn>
        </div>
      </div>
    </div>
  )
}