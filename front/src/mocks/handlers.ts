
import { http, HttpResponse } from 'msw'
import { normalPiroData, normalNumaData } from './data/normal_bus_data'

export const handlers = [
  http.get(import.meta.env.VITE_BACKEND_URL + '/api/trips', async ({ request }) => {
    const url = new URL(request.url);
    const origin = url.searchParams.get('origin');

    if (origin === '22030_2') {
      return HttpResponse.json(normalPiroData)
    } else if (origin === '24140_1') {
      return HttpResponse.json(normalNumaData)
    }

    return HttpResponse.json([])
  }),
]
