import React from 'react'
import ReactDOM from 'react-dom/client'
import {RouterProvider, createBrowserRouter} from "react-router-dom";

import Layout, { SignageLayout } from "./layout";

import TopPage from "./pages/top.tsx";
import Disclaimer from "./pages/Disclaimer.tsx";
import Signage from './pages/Signage.tsx';

import './css/index.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <TopPage />,
      },
      {
        path: "disclaimer",
        element: <Disclaimer />,
      },
      {
        path: "*",
        element: <h2>404 Not found</h2>,
      },
    ],
  },
  {
    path: "/signage",
    element: <SignageLayout />,
    children: [
      {
        index: true,
        element: <Signage />,
      },
    ],
  },
]);


// Service Workerの登録（画像キャッシュ用）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
