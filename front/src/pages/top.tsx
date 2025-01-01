// import { useState } from 'react'

import { Header, Footer } from "../components.tsx"
import React, { useState, useEffect } from 'react';

import '../css/top.css'
import { json } from "react-router-dom";
import { startWorker } from '../mocks/node'



function NextBusesList() {
  const [piroData, setPiroData] = useState<any>(null); // データ
  const [numaData, setNumaData] = useState<any>(null); // データ
  const [loading, setLoading] = useState<boolean>(true); // ローディング状態

  useEffect(() => {
    const fetchData = async () => {
      if (import.meta.env.VITE_USE_MSW === 'true') {
        await startWorker();
      }
      try {
        const piroResponse = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/22030_2/51240?opt=true');
        setPiroData((await piroResponse.json()));
        const numaResponse = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/24140_1/51240?opt=true');
        setNumaData((await numaResponse.json()));
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
            {console.log(piroData[0])}
            {piroData.map((element: any, index: number) => (
              <div key={index} className="NextBusesListCell">
                <p className="BusName">63-2<br />広島バスセンター</p>
                <p className="StaticTime">{element.arrival_time.substring(11, 16)}</p>
                <p className="RemainingMinutes">出発待ち</p>
                <p className="DelayMinutes"></p>
              </div>
            ))}
          </div>
          <div className="NextBusesList numa">
            <p className="StopName">沼田料金所前</p>
            {numaData.map((element: any, index: number) => (
              <div key={index} className="NextBusesListCell">
                <p className="BusName">63-2<br />広島バスセンター</p>
                <p className="StaticTime">{element.arrival_time.substring(11, 16)}</p>
                <p className="RemainingMinutes">出発待ち</p>
                <p className="DelayMinutes"></p>
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
        <TimeTable />
      </main>
      <Footer />
    </>


    /* <div>
      <a href="https://vitejs.dev" target="_blank">
        <img src={viteLogo} className="logo" alt="Vite logo" />
      </a>
      <a href="https://react.dev" target="_blank">
        <img src={reactLogo} className="logo react" alt="React logo" />
      </a>
    </div>
    <h1>Vite + React</h1>
    <div className="card">
      <button onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </button>
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
    </div>
    <p className="read-the-docs">
      Click on the Vite and React logos to learn more
    </p> */
    // </>
  )
}
