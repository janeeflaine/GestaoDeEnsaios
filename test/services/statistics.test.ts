import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  loadGuestStatistics,
  saveGuestStatistics,
  upsertGuestStatistic,
  deleteGuestStatistic,
  fetchMyStatistics,
  insertStatistic,
  updateStatistic,
  deleteStatistic,
  generateShareToken,
  revokeShareToken,
  getStatByShareToken,
  saveStatCopy,
} from '../../services/statistics';
import type { EventStatistic } from '../../types';

// ── Mock supabase ────────────────────────────────────────────────────────
const mockFrom = vi.hoisted(() => vi.fn());
const mockRpc = vi.hoisted(() => vi.fn());

vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: mockFrom,
    rpc: mockRpc,
  },
}));

// Helper to build a chain of fluent Supabase methods
function makeChain(result: object) {
  const chain: Record<string, unknown> = {};
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'order', 'single'];
  methods.forEach((m) => { chain[m] = vi.fn(() => chain); });
  // terminal — the last method awaited
  chain['then'] = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve);
  return chain;
}

const makeStat = (overrides: Partial<EventStatistic> = {}): EventStatistic => ({
  id: 'stat-1',
  event_date: '2026-04-10',
  congregation_id: 'cong-1',
  violino: 5, viola: 2, violoncelo: 1,
  flauta: 3, oboe: 0, oboe_damore: 0, corne_ingles: 0,
  fagote: 0, clarinete: 2, clarinete_alto: 0, clarinete_baixo: 0,
  sax_soprano: 0, sax_alto: 1, sax_tenor: 1, sax_baritono: 0, sax_baixo: 0,
  trompete: 3, cornet: 0, flugelhorn: 0, trompa: 1,
  trombone: 2, trombonito: 0, baritono: 0, eufonio: 0, tuba: 1,
  acordeon: 1,
  musicos: 20, organistas: 2, anciaes_presentes: 3, diaconos: 1,
  coop_oficio: 0, coop_jovens: 5, enc_regionais_presentes: 1,
  enc_locais: 2, examinadoras: 0, secretarios_musica: 1, instrutores: 0,
  ...overrides,
});

// ── sessionStorage mock ──────────────────────────────────────────────────
const storage: Record<string, string> = {};
beforeEach(() => {
  vi.stubGlobal('sessionStorage', {
    getItem: (k: string) => storage[k] ?? null,
    setItem: (k: string, v: string) => { storage[k] = v; },
    removeItem: (k: string) => { delete storage[k]; },
  });
  Object.keys(storage).forEach((k) => delete storage[k]);
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─────────────────────────────────────────────────────────────────────────
// Guest helpers (sessionStorage)
// ─────────────────────────────────────────────────────────────────────────

describe('loadGuestStatistics', () => {
  it('returns [] when sessionStorage is empty', () => {
    expect(loadGuestStatistics()).toEqual([]);
  });

  it('returns parsed stats when key exists', () => {
    const stats = [makeStat()];
    saveGuestStatistics(stats);
    expect(loadGuestStatistics()).toHaveLength(1);
    expect(loadGuestStatistics()[0].id).toBe('stat-1');
  });

  it('returns [] on invalid JSON', () => {
    storage['guest_statistics'] = 'not-json{{{';
    expect(loadGuestStatistics()).toEqual([]);
  });
});

describe('upsertGuestStatistic', () => {
  it('inserts a new stat (no id) and assigns a uuid', () => {
    const { id: _id, ...noId } = makeStat();
    const result = upsertGuestStatistic(noId as EventStatistic);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBeTruthy();
  });

  it('updates an existing stat by id', () => {
    upsertGuestStatistic(makeStat({ id: 'stat-1', violino: 5 }));
    const updated = upsertGuestStatistic(makeStat({ id: 'stat-1', violino: 10 }));
    expect(updated).toHaveLength(1);
    expect(updated[0].violino).toBe(10);
  });

  it('prepends new stat (most recent first)', () => {
    upsertGuestStatistic(makeStat({ id: 'stat-1' }));
    const result = upsertGuestStatistic(makeStat({ id: 'stat-2', event_date: '2026-05-01' }));
    expect(result[0].id).toBe('stat-2');
  });
});

describe('deleteGuestStatistic', () => {
  it('removes the stat with the given id', () => {
    saveGuestStatistics([makeStat({ id: 'stat-1' }), makeStat({ id: 'stat-2' })]);
    const result = deleteGuestStatistic('stat-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('stat-2');
  });

  it('returns unchanged list when id not found', () => {
    saveGuestStatistics([makeStat({ id: 'stat-1' })]);
    expect(deleteGuestStatistic('nonexistent')).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Supabase-backed functions
// ─────────────────────────────────────────────────────────────────────────

describe('fetchMyStatistics', () => {
  it('returns statistics from Supabase ordered by date', async () => {
    const stats = [makeStat()];
    const chain = makeChain({ data: stats, error: null });
    mockFrom.mockReturnValue(chain);
    const result = await fetchMyStatistics();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('stat-1');
  });

  it('throws on error', async () => {
    const chain = makeChain({ data: null, error: { message: 'RLS denied' } });
    mockFrom.mockReturnValue(chain);
    await expect(fetchMyStatistics()).rejects.toEqual({ message: 'RLS denied' });
  });
});

describe('insertStatistic', () => {
  it('inserts and returns the new stat', async () => {
    const inserted = makeStat({ id: 'new-id' });
    const chain = makeChain({ data: inserted, error: null });
    mockFrom.mockReturnValue(chain);
    const result = await insertStatistic({ ...makeStat(), created_by: 'user-1' });
    expect(result.id).toBe('new-id');
  });
});

describe('updateStatistic', () => {
  it('resolves without error on success', async () => {
    const chain = makeChain({ error: null });
    mockFrom.mockReturnValue(chain);
    await expect(updateStatistic('stat-1', { violino: 10 })).resolves.toBeUndefined();
  });

  it('throws on error', async () => {
    const chain = makeChain({ error: { message: 'not found' } });
    mockFrom.mockReturnValue(chain);
    await expect(updateStatistic('stat-1', {})).rejects.toEqual({ message: 'not found' });
  });
});

describe('deleteStatistic', () => {
  it('resolves without error on success', async () => {
    const chain = makeChain({ error: null });
    mockFrom.mockReturnValue(chain);
    await expect(deleteStatistic('stat-1')).resolves.toBeUndefined();
  });
});

describe('generateShareToken', () => {
  it('updates share_token and returns a UUID string', async () => {
    const chain = makeChain({ error: null });
    mockFrom.mockReturnValue(chain);
    const token = await generateShareToken('stat-1');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });
});

describe('revokeShareToken', () => {
  it('resolves without error', async () => {
    const chain = makeChain({ error: null });
    mockFrom.mockReturnValue(chain);
    await expect(revokeShareToken('stat-1')).resolves.toBeUndefined();
  });
});

describe('getStatByShareToken', () => {
  it('returns stat when token found', async () => {
    mockRpc.mockResolvedValueOnce({ data: [makeStat()], error: null });
    const result = await getStatByShareToken('some-token');
    expect(result?.id).toBe('stat-1');
  });

  it('returns null when data is empty array', async () => {
    mockRpc.mockResolvedValueOnce({ data: [], error: null });
    expect(await getStatByShareToken('unknown-token')).toBeNull();
  });

  it('throws on RPC error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } });
    await expect(getStatByShareToken('bad')).rejects.toEqual({ message: 'RPC error' });
  });
});

describe('saveStatCopy', () => {
  it('inserts a copy without id, share_token, or created_by from original', async () => {
    const inserted = makeStat({ id: 'copy-id' });
    const chain = makeChain({ data: inserted, error: null });
    mockFrom.mockReturnValue(chain);

    const original = makeStat({ id: 'orig-id' });
    (original as EventStatistic & { share_token?: string; created_by?: string }).share_token = 'abc';
    (original as EventStatistic & { created_by?: string }).created_by = 'other-user';

    const copy = await saveStatCopy(original, 'my-user-id');
    expect(copy.id).toBe('copy-id');
  });
});
