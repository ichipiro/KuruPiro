import React from 'react'
import ReactDOM from 'react-dom/client'
import {RouterProvider, createBrowserRouter} from "react-router-dom";

import Layout, { SignageLayout } from "./layout";

import TopPage from "./pages/top.tsx";
import Disclaimer from "./pages/Disclaimer.tsx";

import './css/index.css'
import Signage from './pages/Signage.tsx';

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


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
