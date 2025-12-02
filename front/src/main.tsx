import React from 'react'
import ReactDOM from 'react-dom/client'
import {RouterProvider, createBrowserRouter} from "react-router-dom";

import { SignageLayout } from "./layout";

import './css/index.css'
import Signage from './pages/Signage.tsx';

const router = createBrowserRouter([
  {
    path: "/",
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
