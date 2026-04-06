import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchEvents, deleteEvent, updateEventStatus } from '../../services/events';

// vi.hoisted ensures these are initialized before vi.mock factory runs
const mockSelect = vi.hoisted(() => vi.fn());
const mockIs = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
const mockEq = vi.hoisted(() => vi.fn());
const mockUpsert = vi.hoisted(() => vi.fn());

vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect.mockReturnThis(),
      is: mockIs,
      update: mockUpdate.mockReturnThis(),
      eq: mockEq,
      upsert: mockUpsert,
    })),
  },
}));

const rawEvents = [
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
];

describe('fetchEvents', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns events mapped with fullDate as Date', async () => {
    mockIs.mockResolvedValueOnce({ data: rawEvents, error: null });
    const events = await fetchEvents();
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe('evt-1');
    expect(events[0].fullDate).toBeInstanceOf(Date);
    expect(events[0].fullDate.toISOString()).toBe('2026-04-10T09:00:00.000Z');
  });

  it('returns empty array when data is null', async () => {
    mockIs.mockResolvedValueOnce({ data: null, error: null });
    const events = await fetchEvents();
    expect(events).toEqual([]);
  });

  it('throws when Supabase returns an error', async () => {
    mockIs.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } });
    await expect(fetchEvents()).rejects.toEqual({ message: 'DB error' });
  });
});

describe('deleteEvent (soft delete)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls update with deleted_at and resolves without error', async () => {
    mockEq.mockResolvedValueOnce({ error: null });
    await expect(deleteEvent('evt-1')).resolves.toBeUndefined();
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ deleted_at: expect.any(String) })
    );
    expect(mockEq).toHaveBeenCalledWith('id', 'evt-1');
  });

  it('throws when Supabase returns an error', async () => {
    mockEq.mockResolvedValueOnce({ error: { message: 'Update failed' } });
    await expect(deleteEvent('evt-1')).rejects.toEqual({ message: 'Update failed' });
  });
});

describe('updateEventStatus', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls update with canceled value and resolves without error', async () => {
    mockEq.mockResolvedValueOnce({ error: null });
    await expect(updateEventStatus('evt-1', true)).resolves.toBeUndefined();
    expect(mockUpdate).toHaveBeenCalledWith({ canceled: true });
    expect(mockEq).toHaveBeenCalledWith('id', 'evt-1');
  });
});
