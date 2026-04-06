import { supabase } from '../supabaseClient';
import type { Presence } from '../types';

export async function fetchPresences(): Promise<Presence[]> {
  const { data, error } = await supabase.from('presences').select('*');
  if (error) throw error;
  return (data ?? []).map((p) => ({
    ...p,
    eventId: p.event_id,
    timestamp: new Date(p.timestamp),
  }));
}

export async function insertPresence(presence: Record<string, unknown>) {
  const { error } = await supabase.from('presences').insert(presence);
  if (error) throw error;
}

export async function deletePresence(id: string) {
  const { error } = await supabase.from('presences').delete().eq('id', id);
  if (error) throw error;
}
