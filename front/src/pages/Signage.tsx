import BusCard from '../components/signage/Bus-card'
import BusCardList from '../components/signage/Bus-card-list'
import BusColumn from '../components/signage/Bus-column'
import Sidebar from '../components/signage/Sidebar'
import { useJapanTime } from '../hooks/useJapanTime'
import { useWeather } from '../hooks/useWeather'
import { usePiroBusData, useNumaBusData } from '../hooks/useBusData'
import '../css/signage.css'

export default function Signage() {
  const currentTime = useJapanTime()
  const weather = useWeather()
  const { data: piroData, isLoading: piroLoading } = usePiroBusData()
  const { data: numaData, isLoading: numaLoading } = useNumaBusData()

  return (
    <div className="bg-[#005394] h-screen overflow-y-hidden flex gap-[12px]">
      {/* 左サイドバー */}
      <div className="flex-1 min-w-0">
        <Sidebar 
          currentTime={currentTime} 
          temperature={weather.temperature}
          weatherIcon={weather.icon}
        />
      </div>
      
      {/* バス情報エリア */}
      <div className="mt-[18px] flex justify-center gap-[12px] flex-[2]">
        {/* 左カラム: 沼田料金所前 */}
        <div className="flex-1 min-w-0">
          <BusColumn stopName="沼田料金所前">
            {numaLoading ? (
              <div className="text-white text-center">読み込み中...</div>
            ) : numaData.length === 0 ? (
              <div className="text-white text-center">運行情報がありません</div>
            ) : (
              <>
                {/* 1便目 */}
                <BusCard
                  busId={numaData[0].busId}
                  destination={numaData[0].destination}
                  via={numaData[0].via}
                  scheduledTime={numaData[0].scheduledTime}
                  delayedTime={numaData[0].delayedTime}
                  remainingMinutes={numaData[0].remainingMinutes}
                  isRecommended={true}
                />
                {/* 2便目以降 */}
                {numaData.slice(1).map((bus, index) => (
                  <BusCardList
                    key={index}
                    busId={bus.busId}
                    destination={bus.destination}
                    via={bus.via}
                    scheduledTime={bus.scheduledTime}
                    delayedTime={bus.delayedTime}
                    remainingMinutes={bus.remainingMinutes}
                  />
                ))}
              </>
            )}
          </BusColumn>
        </div>

        {/* 右カラム: 市立大学前 */}
        <div className="flex-1 min-w-0 mr-[32px]">
          <BusColumn stopName="市立大学前">
            {piroLoading ? (
              <div className="text-white text-center">読み込み中...</div>
            ) : piroData.length === 0 ? (
              <div className="text-white text-center">運行情報がありません</div>
            ) : (
              <>
                {/* 1便目 */}
                <BusCard
                  busId={piroData[0].busId}
                  destination={piroData[0].destination}
                  via={piroData[0].via}
                  scheduledTime={piroData[0].scheduledTime}
                  delayedTime={piroData[0].delayedTime}
                  remainingMinutes={piroData[0].remainingMinutes}
                  isRecommended={true}
                />
                {/* 2便目以降 */}
                {piroData.slice(1).map((bus, index) => (
                  <BusCardList
                    key={index}
                    busId={bus.busId}
                    destination={bus.destination}
                    via={bus.via}
                    scheduledTime={bus.scheduledTime}
                    delayedTime={bus.delayedTime}
                    remainingMinutes={bus.remainingMinutes}
                  />
                ))}
              </>
            )}
          </BusColumn>
        </div>
      </div>
    </div>
  )
}