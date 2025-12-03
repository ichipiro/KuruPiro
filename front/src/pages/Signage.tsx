import { useRef } from 'react'
import AnimatedBusList from '../components/signage/AnimatedBusList'
import BusColumn from '../components/signage/Bus-column'
import BusConnectionLines from '../components/signage/BusConnectionLines'
import Sidebar from '../components/signage/Sidebar'
import { useJapanTime } from '../hooks/useJapanTime'
import { useWeather } from '../hooks/useWeather'
import { usePiroBusData, useNumaBusData } from '../hooks/useBusData'
import '../css/signage.css'

// 画面高さに応じて表示便数を計算
function useDisplayCount() {
  return 4 // 4便固定
}

export default function Signage() {
  const currentTime = useJapanTime()
  const weather = useWeather()
  const { data: piroData, isLoading: piroLoading } = usePiroBusData()
  const { data: numaData, isLoading: numaLoading } = useNumaBusData()
  const displayCount = useDisplayCount()

  // おすすめロジック:
  // - 沼田1便目が市大に来る → 市大をおすすめ（沼田はおすすめなし）
  // - 沼田1便目が市大に来ない場合:
  //   - 沼田まで10分より多い かつ 市大1便目より早い → 沼田をおすすめ
  //   - それ以外 → 市大をおすすめ
  const { numaRecommendedIndex, piroRecommendedIndex } = (() => {
    if (piroData.length === 0 || numaData.length === 0) {
      return { numaRecommendedIndex: -1, piroRecommendedIndex: 0 }
    }

    // 市大に来るバスのセット（trip_id で識別）
    const piroBusSet = new Set(piroData.map(bus => bus.tripId))

    // 沼田1便目が市大に来るかチェック
    const numaBus = numaData[0]
    const piroBus = piroData[0]
    const comesToPiro = piroBusSet.has(numaBus.tripId)

    if (comesToPiro) {
      // 沼田が市大に来る → 市大をおすすめ
      return { numaRecommendedIndex: -1, piroRecommendedIndex: 0 }
    } else {
      // 沼田が市大に来ない場合
      // 沼田まで10分より多い(600秒より大きい) かつ 市大1便目より早いなら沼田をおすすめ
      const isMoreThan10Min = numaBus.remainingSeconds > 600
      const isFasterThanPiro = numaBus.remainingSeconds < piroBus.remainingSeconds
      if (isMoreThan10Min && isFasterThanPiro) {
        return { numaRecommendedIndex: 0, piroRecommendedIndex: -1 }
      } else {
        // そうでなければ市大をおすすめ
        return { numaRecommendedIndex: -1, piroRecommendedIndex: 0 }
      }
    }
  })()

  // 線を引くための参照
  const busAreaRef = useRef<HTMLDivElement>(null)

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
      <div ref={busAreaRef} className="relative py-[0.9375vw] pr-[1.67vw] flex justify-center gap-[0.625vw] flex-[2] h-full">
        {/* 同じバスを結ぶ線 */}
        <BusConnectionLines containerRef={busAreaRef} />

        {/* 左カラム: 沼田料金所前 */}
        <div className="flex-1 min-w-0 h-full">
          <BusColumn stopName="沼田料金所前">
            {numaLoading ? (
              <div className="text-white text-center">読み込み中...</div>
            ) : (
              <AnimatedBusList buses={numaData} displayCount={displayCount} recommendedIndex={numaRecommendedIndex} columnId="numa" />
            )}
          </BusColumn>
        </div>

        {/* 右カラム: 市立大学前 */}
        <div className="flex-1 min-w-0 h-full">
          <BusColumn stopName="市立大学前">
            {piroLoading ? (
              <div className="text-white text-center">読み込み中...</div>
            ) : (
              <AnimatedBusList buses={piroData} displayCount={displayCount} recommendedIndex={piroRecommendedIndex} columnId="piro" />
            )}
          </BusColumn>
        </div>
      </div>
    </div>
  )
}