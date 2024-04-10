import React from 'react'
import ReactDOM from 'react-dom/client'
import {RouterProvider, createBrowserRouter} from "react-router-dom";

import {TopPage} from "./pages/top.tsx";

import './css/index.css'


function Error404() {
  return <h2>404 Not found</h2>;
}


const router = createBrowserRouter([
  {
    path: "/",
    element: <TopPage />,
    errorElement: <Error404 />,
  },
]);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
