import { http, HttpResponse } from 'msw';

// Base URL used by Supabase client when env vars are missing (see supabaseClient.ts)
const SUPABASE_URL = 'https://missing-url.supabase.co';

export const mockEvents = [
  {
    id: 'evt-1',
    month: 'Abril',
    day: '10',
    full_date: '2026-04-10T09:00:00.000Z',
    location: 'Congregação Central',
    time: '09:00',
    conductor: 'João Silva',
    type: 'Local',
    canceled: false,
    deleted_at: null,
  },
  {
    id: 'evt-2',
    month: 'Abril',
    day: '17',
    full_date: '2026-04-17T09:00:00.000Z',
    location: 'Congregação Norte',
    time: '09:00',
    conductor: 'Maria Santos',
    type: 'Local',
    canceled: false,
    deleted_at: null,
  },
];

export const mockPresences = [
  {
    id: 'pres-1',
    eventId: 'evt-1',
    name: 'Carlos Oliveira',
    email: 'carlos@test.com',
    phone: '11999999999',
    instrument: 'Violino',
    timestamp: '2026-04-10T10:00:00.000Z',
  },
];

export const handlers = [
  // GET events (with deleted_at IS NULL filter)
  http.get(`${SUPABASE_URL}/rest/v1/events`, () => {
    return HttpResponse.json(mockEvents);
  }),

  // GET presences
  http.get(`${SUPABASE_URL}/rest/v1/presences`, () => {
    return HttpResponse.json(mockPresences);
  }),

  // POST presences (confirm presence)
  http.post(`${SUPABASE_URL}/rest/v1/presences`, () => {
    return HttpResponse.json({ id: 'pres-new' }, { status: 201 });
  }),

  // PATCH events (update / soft-delete)
  http.patch(`${SUPABASE_URL}/rest/v1/events`, () => {
    return HttpResponse.json({});
  }),

  // Gemini proxy Edge Function
  http.post(`${SUPABASE_URL}/functions/v1/gemini-proxy`, () => {
    return HttpResponse.json({ text: 'Resposta simulada da IA.' });
  }),
];
