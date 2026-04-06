import { supabase } from '../supabaseClient';
import type { Congregation, ServiceDay, Ministry } from '../types';

export async function fetchCongregations(): Promise<Congregation[]> {
  const { data, error } = await supabase
    .from('congregations')
    .select('*, service_days(*), ministry(*)');
  if (error) throw error;
  return (data ?? []).map((c) => ({
    ...c,
    serviceDays: c.service_days || [],
    ministry: c.ministry || [],
  }));
}

export async function upsertCongregation(congregationData: Record<string, unknown>) {
  const { error } = await supabase.from('congregations').upsert(congregationData);
  if (error) throw error;
}

export async function deleteCongregation(id: string) {
  const { error } = await supabase.from('congregations').delete().eq('id', id);
  if (error) throw error;
}

export async function replaceServiceDays(congregationId: string, serviceDays: ServiceDay[]) {
  await supabase.from('service_days').delete().eq('congregation_id', congregationId);
  for (const sd of serviceDays) {
    if (sd.day && sd.time) {
      await supabase
        .from('service_days')
        .insert({ congregation_id: congregationId, day: sd.day, time: sd.time });
    }
  }
}

export async function replaceMinistry(congregationId: string, ministry: Ministry[]) {
  await supabase.from('ministry').delete().eq('congregation_id', congregationId);
  for (const m of ministry) {
    if (m.role && m.name) {
      await supabase.from('ministry').insert({
        congregation_id: congregationId,
        role: m.role,
        name: m.name,
        profile_id: m.profileId,
      });
    }
  }
}
