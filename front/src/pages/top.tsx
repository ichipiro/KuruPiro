import { Header, Footer } from "../components.tsx"
import { useState, useEffect } from 'react';

import '../css/top.css'
import { startWorker } from '../mocks/node'
import { BusService } from "../types/api.ts";



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
        const piroResponse = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/22030_2/51240_', {
          method: "GET",
          credentials: "include",
        });
        const piroData = await piroResponse.json();
        setPiroData(piroData);
        console.log(piroData)
        const numaResponse = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/24140_1/51240_', {
          method: "GET",
          credentials: "include",
        });
        const numaData = await numaResponse.json();
        setNumaData(numaData);
        console.log(numaData)
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

function TimeTable() {
  return (
    <div className="TimeTableSection">
      時刻表
    </div>
  )
}

export function TopPage(): JSX.Element {

  return (
    <>
      <Header />
      <main>
        <NextBusesList />
        {/* <TimeTable /> */}
      </main>
      <Footer />
    </>
  )
}
