
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/rap/login', async () => {
    // const body = await request.json()
    return HttpResponse.json({ token: 'mock-token' })
  }),
  http.get('/api/rap/menu', () => {
    return HttpResponse.json({ id: 1, name: 'Mock User' })
  }),

]
