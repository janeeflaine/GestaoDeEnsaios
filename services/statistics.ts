import { supabase } from '../supabaseClient';
import type { EventStatistic } from '../types';

const GUEST_KEY = 'guest_statistics';

// ── Guest (sessionStorage) helpers ────────────────────────────

export function loadGuestStatistics(): EventStatistic[] {
  try {
    const raw = sessionStorage.getItem(GUEST_KEY);
    return raw ? (JSON.parse(raw) as EventStatistic[]) : [];
  } catch {
    return [];
  }
}

export function saveGuestStatistics(stats: EventStatistic[]): void {
  sessionStorage.setItem(GUEST_KEY, JSON.stringify(stats));
}

export function upsertGuestStatistic(stat: EventStatistic): EventStatistic[] {
  const all = loadGuestStatistics();
  if (stat.id) {
    const idx = all.findIndex((s) => s.id === stat.id);
    if (idx >= 0) {
      all[idx] = stat;
    } else {
      all.unshift(stat);
    }
  } else {
    const newStat = { ...stat, id: crypto.randomUUID() };
    all.unshift(newStat);
  }
  saveGuestStatistics(all);
  return all;
}

export function deleteGuestStatistic(id: string): EventStatistic[] {
  const all = loadGuestStatistics().filter((s) => s.id !== id);
  saveGuestStatistics(all);
  return all;
}

// ── Supabase (authenticated) helpers ─────────────────────────

export async function fetchMyStatistics(): Promise<EventStatistic[]> {
  const { data, error } = await supabase
    .from('event_statistics')
    .select('*')
    .order('event_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as EventStatistic[];
}

export async function insertStatistic(
  stat: Omit<EventStatistic, 'id' | 'created_at'> & { created_by: string }
): Promise<EventStatistic> {
  const { data, error } = await supabase
    .from('event_statistics')
    .insert(stat)
    .select()
    .single();
  if (error) throw error;
  return data as EventStatistic;
}

export async function updateStatistic(
  id: string,
  stat: Partial<EventStatistic>
): Promise<void> {
  const { error } = await supabase
    .from('event_statistics')
    .update(stat)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteStatistic(id: string): Promise<void> {
  const { error } = await supabase
    .from('event_statistics')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/** Generate (or reset) a share_token on a statistic. Returns the new token. */
export async function generateShareToken(statId: string): Promise<string> {
  const token = crypto.randomUUID();
  const { error } = await supabase
    .from('event_statistics')
    .update({ share_token: token })
    .eq('id', statId);
  if (error) throw error;
  return token;
}

/** Revoke a share_token (sets it to null). */
export async function revokeShareToken(statId: string): Promise<void> {
  const { error } = await supabase
    .from('event_statistics')
    .update({ share_token: null })
    .eq('id', statId);
  if (error) throw error;
}

/** Fetch a shared statistic by token (calls the SECURITY DEFINER RPC). */
export async function getStatByShareToken(
  token: string
): Promise<EventStatistic | null> {
  const { data, error } = await supabase.rpc('get_stat_by_share_token', {
    p_token: token,
  });
  if (error) throw error;
  if (!data || (Array.isArray(data) && data.length === 0)) return null;
  return (Array.isArray(data) ? data[0] : data) as EventStatistic;
}

/** Save a copy of a shared statistic to the current user's panel. */
export async function saveStatCopy(
  stat: EventStatistic,
  createdBy: string
): Promise<EventStatistic> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, created_at: _ca, share_token: _st, created_by: _cb, ...rest } = stat as EventStatistic & {
    id?: string;
    created_at?: string;
    share_token?: string;
    created_by?: string;
  };
  return insertStatistic({ ...rest, created_by: createdBy });
}
