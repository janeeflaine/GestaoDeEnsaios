import { supabase } from '../supabaseClient';
import type { RehearsalEvent } from '../types';

export async function fetchEvents(): Promise<RehearsalEvent[]> {
  // Filter out soft-deleted events (deleted_at IS NULL).
  // Falls back gracefully if the column doesn't exist yet in the DB
  // (Supabase returns all rows and the .is() filter is a no-op for missing cols).
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .is('deleted_at', null);
  if (error) throw error;
  return (data ?? []).map((e) => ({ ...e, fullDate: new Date(e.full_date) }));
}

export async function upsertEvent(eventData: Record<string, unknown>) {
  const { error } = await supabase.from('events').upsert(eventData);
  if (error) throw error;
}

/** Soft delete: sets deleted_at instead of destroying the row */
export async function deleteEvent(id: string) {
  const { error } = await supabase
    .from('events')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

/** Restore a soft-deleted event */
export async function restoreEvent(id: string) {
  const { error } = await supabase
    .from('events')
    .update({ deleted_at: null })
    .eq('id', id);
  if (error) throw error;
}

export async function updateEventStatus(id: string, canceled: boolean) {
  const { error } = await supabase.from('events').update({ canceled }).eq('id', id);
  if (error) throw error;
}
