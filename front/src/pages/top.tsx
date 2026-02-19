import { useState, useEffect } from 'react';

import '../css/top.css'
import { startWorker } from '../mocks/node'
import { BusService } from "../types/api.ts";



async function fetchBusData(url: string, retries = 5, intervalMs = 1000): Promise<BusService[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();
    if (Array.isArray(data)) {
      return data;
    }
    console.warn(`attempt ${attempt}/${retries} failed:`, data);
    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
  return [];
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
        const [piroData, numaData] = await Promise.all([
          fetchBusData(baseUrl + '/api/trips?origin=22030_2&destination=51240_'),
          fetchBusData(baseUrl + '/api/trips?origin=24140_1&destination=51240_'),
        ]);
        console.log(piroData, numaData);
        setPiroData(piroData);
        setNumaData(numaData);
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
                <p className="BusName">{element.trip_short_id}<br />{element.trip_dest}</p>
                <p className="StaticTime">{element.arrival_time}</p>
                <p className="RemainingMinutes">{element.remaining_time}</p>
                <p className="DelayMinutes">{element.delay}</p>
              </div>
            ))}
          </div>
          <div className="NextBusesList numa">
            <p className="StopName">沼田料金所前</p>
            {numaData.map((element: BusService, index: number) => (
              <div key={index} className="NextBusesListCell">
                <p className="BusName">{element.trip_short_id}<br />{element.trip_dest}</p>
                <p className="StaticTime">{element.arrival_time}</p>
                <p className="RemainingMinutes">{element.remaining_time}</p>
                <p className="DelayMinutes">{element.delay}</p>
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

function TopPage(): JSX.Element {

  return (
    <>
      <NextBusesList />
      {/* <TimeTable /> */}
    </>
  )
}

export default TopPage;
