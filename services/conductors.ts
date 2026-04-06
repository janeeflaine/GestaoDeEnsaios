import { supabase } from '../supabaseClient';
import type { Encarregado, PendingConductor } from '../types';

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

/** Submit a pending enc. regional request (non-admin users) */
export async function submitPendingConductor(
    name: string,
    congregation: string | undefined,
    requestedBy: string | undefined,
    requesterName: string | undefined,
    statId: string | undefined,
): Promise<void> {
    await supabase.from('pending_conductors').insert({
        name,
        congregation: congregation ?? null,
        requested_by: requestedBy ?? null,
        requester_name: requesterName ?? null,
        stat_id: statId ?? null,
    });
}

/** Fetch all pending conductor requests (admin only) */
export async function fetchPendingConductors(): Promise<PendingConductor[]> {
    const { data, error } = await supabase
        .from('pending_conductors')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as PendingConductor[];
}

/** Approve: save to conductors table + mark approved */
export async function approvePendingConductor(pending: PendingConductor): Promise<void> {
    const { error: insertErr } = await supabase
        .from('conductors')
        .insert({
            id: crypto.randomUUID(),
            name: pending.name,
            congregation: pending.congregation ?? '',
            type: 'Regional',
        });
    if (insertErr) throw insertErr;

    await supabase
        .from('pending_conductors')
        .update({ status: 'approved' })
        .eq('id', pending.id);
}

/** Reject: just mark rejected */
export async function rejectPendingConductor(id: string): Promise<void> {
    await supabase
        .from('pending_conductors')
        .update({ status: 'rejected' })
        .eq('id', id);
}
