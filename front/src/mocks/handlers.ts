
import { http, HttpResponse } from 'msw'
import { normalPiroData, normalNumaData } from './data/normal_bus_data'

export const handlers = [
  http.get(import.meta.env.VITE_BACKEND_URL + '/api/22030_2/:destId', async () => {
    return HttpResponse.json(normalPiroData)
  }),
  http.get(import.meta.env.VITE_BACKEND_URL + '/api/24140_1/:destId', async () => {
    return HttpResponse.json(normalNumaData)
  }),
]
