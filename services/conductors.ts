import { supabase } from '../supabaseClient';
import type { Encarregado } from '../types';

export async function fetchConductors(): Promise<Encarregado[]> {
  const { data, error } = await supabase.from('conductors').select('*');
  if (error) throw error;
  return (data ?? []).map((c) => ({ ...c, photoUrl: c.photo_url }));
}

export async function upsertConductor(data: Record<string, unknown>) {
  const { error } = await supabase.from('conductors').upsert(data);
  if (error) throw error;
}

export async function deleteConductor(id: string) {
  const { error } = await supabase.from('conductors').delete().eq('id', id);
  if (error) throw error;
}
