import { supabase } from '../supabaseClient';
import { PendingAnciao } from '../types';

/** Submit a pending ancião request (non-admin users) */
export async function submitPendingAnciao(
    name: string,
    requestedBy: string | undefined,
    requesterName: string | undefined,
    statId: string | undefined,
): Promise<void> {
    await supabase.from('pending_anciaes').insert({
        name,
        requested_by: requestedBy ?? null,
        requester_name: requesterName ?? null,
        stat_id: statId ?? null,
    });
}

/** Fetch all pending requests (admin only) */
export async function fetchPendingAnciaes(): Promise<PendingAnciao[]> {
    const { data, error } = await supabase
        .from('pending_anciaes')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as PendingAnciao[];
}

/** Approve: save to anciaes table + mark approved */
export async function approvePendingAnciao(pending: PendingAnciao): Promise<void> {
    const { error: insertErr } = await supabase
        .from('anciaes')
        .insert({ name: pending.name });
    if (insertErr) throw insertErr;

    await supabase
        .from('pending_anciaes')
        .update({ status: 'approved' })
        .eq('id', pending.id);
}

/** Reject: just mark rejected */
export async function rejectPendingAnciao(id: string): Promise<void> {
    await supabase
        .from('pending_anciaes')
        .update({ status: 'rejected' })
        .eq('id', id);
}
