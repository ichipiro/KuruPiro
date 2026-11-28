import { useState, useEffect } from 'react';

import '../css/top.css'
import { startWorker } from '../mocks/node'
import { BusService, BusServicesByOrigin } from "../types/api.ts";

async function fetchMultiBusData(url: string, retries = 5, intervalMs = 1000): Promise<BusServicesByOrigin> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data;
    }
    console.warn(`attempt ${attempt}/${retries} failed:`, data);
    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
  return {};
}

function createDynamicTime(staticTime: string, delays: string) {
  const timeArray: number[] = staticTime.split(":").map((content:string) => parseInt(content));
  const delayMinutes = delays === "" ? 0: parseInt(delays);

  const [hour, minute] = timeArray;
  return `${(hour + Math.trunc((minute + delayMinutes) / 60)).toString().padStart(2, '0')}:${((minute + delayMinutes) % 60).toString().padStart(2, '0')}`
}

function createViaClassName(short_id: string) {
  short_id = short_id.split("-")[0]
  const viaStopMap = new Map<string, string>([
    ["60", "ViaNakahiro"],
    ["61", "ViaYokogawa"],
    ["62", "ViaNakahiro"],
    ["63", "ViaYokogawa"],
    ["64", "ViaNakahiro"],
    ["65", "ViaYokogawa"],
    ["1",  "ViaIshiuchi"],
    ["201", "ViaAlpark"],
  ]);

  return viaStopMap.get(short_id)
}

function createViaStopText(short_id: string) {
  short_id = short_id.split("-")[0]
  const viaStopMap = new Map<string, string>([
    ["60", "中広町経由"],
    ["61", "横川駅前経由"],
    ["62", "中広町経由"],
    ["63", "横川駅前経由"],
    ["64", "中広町経由"],
    ["65", "横川駅前経由"],
    ["1",  "修大･免許セ経由"],
    ["201", "ｱｳﾄﾚｯﾄ･ｱﾙﾊﾟｰｸ経由"],
  ]);

  return viaStopMap.get(short_id)
}

function NextBusesList() {
  const [piroData, setPiroData] = useState<BusService[]>([]);
  const [numaData, setNumaData] = useState<BusService[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // ローディング状態

  useEffect(() => {
    const fetchData = async () => {
      if (import.meta.env.VITE_USE_MSW === 'true') {
        await startWorker();
      }
      try {
        const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
        const result = await fetchMultiBusData(
          baseUrl + '/api/trips?origin=22030_2,24140_1&destination=10_,50020_,3220_,105_'
        );
        console.log(result);
        setPiroData(result['22030_2'] ?? []);
        setNumaData(result['24140_1'] ?? []);
      } catch (error) {
        console.error('データの取得中にエラーが発生しました:', error);
      } finally {
        setLoading(false); // ローディング状態を終了する
      }
    };
    fetchData();
  }, []);
  return (
    <div className="NextBusesListSection">
      <h3>次便リスト</h3>
      <hr />
      {loading === true ? (
        <>Loading...</>
      ) : (
        <div className="NextBusesLists">
          <div className="NextBusesList piro">
            <p className="StopName">市立大学前</p>
            {piroData.map((element: BusService, index: number) => (
              <div key={index} className="NextBusesListCell">
                <div className={"BusName " + createViaClassName(element.trip_short_id)}>
                  <p className="BusShortId">{element.trip_short_id}</p>
                  <p className={"BusDestination " + createViaClassName(element.trip_short_id)}>{element.trip_dest}</p>
                </div>
                <div className='BusArrivalTime'>
                  <div className='CalculatedTime'>
                  <p className={element.delay === "" ? "StaticTime": "StaticTime delayed"}>{element.arrival_time}</p>
                  <p className='DynamicTime'>
                    {
                      element.delay === "" ? "": createDynamicTime(element.arrival_time, element.delay)
                    }
                  </p>
                  </div>
                  <p className="DelayMinutes">{element.delay}</p>
                </div>
                <div className='ViaStopAndRemainingMinutes'>
                  <p className="ViaStop">{createViaStopText(element.trip_short_id)}</p>
                  <p className="RemainingMinutes">{element.remaining_time}</p>
                </div>
                <p className='CurrentLocation'>{element.current_location != "" ? element.current_location +"を通過": "発車待ち"}</p>
              </div>
            ))}
          </div>
          <div className="NextBusesList numa">
            <p className="StopName">沼田料金所前</p>
            {numaData.map((element: BusService, index: number) => (
              <div key={index} className="NextBusesListCell">
                <div className={"BusName " + createViaClassName(element.trip_short_id)}>
                  <p className="BusShortId">{element.trip_short_id}</p>
                  <p className={"BusDestination " + createViaClassName(element.trip_short_id)}>{element.trip_dest}</p>
                </div>
                <div className='BusArrivalTime'>
                  <div className='CalculatedTime'>
                  <p className={element.delay === "" ? "StaticTime": "StaticTime delayed"}>{element.arrival_time}</p>
                  <p className='DynamicTime'>
                    {
                      element.delay === "" ? "": createDynamicTime(element.arrival_time, element.delay)
                    }
                  </p>
                  </div>
                  <p className="DelayMinutes">{element.delay}</p>
                </div>
                <div className='ViaStopAndRemainingMinutes'>
                  <p className="ViaStop">{createViaStopText(element.trip_short_id)}</p>
                  <p className="RemainingMinutes">{element.remaining_time}</p>
                </div>
                <p className='CurrentLocation'>{element.current_location != "" ? element.current_location +"を通過": "発車待ち"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// function TimeTable() {
//   return (
//     <div className="TimeTableSection">
//       時刻表
//     </div>
//   )
// }

function TopPage() {

  return (
    <>
      <NextBusesList />
      {/* <TimeTable /> */}
    </>
  )
}

export default TopPage;
