import { supabase } from '../supabaseClient';
import type { UserProfile } from '../types';

export async function fetchUserProfile(userId: string): Promise<(UserProfile & { photoUrl: string }) | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return { ...data, photoUrl: data.photo_url };
}

export async function fetchAllProfiles(): Promise<UserProfile[]> {
  const { data } = await supabase.from('profiles').select('*').order('name');
  return data ?? [];
}

export async function upsertProfile(profile: Record<string, unknown>) {
  const { error } = await supabase.from('profiles').upsert(profile);
  if (error) throw error;
}

export async function updateProfile(
  userId: string,
  updates: Record<string, unknown>
): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select();
  if (error) throw error;
  return data ?? [];
}

export async function deleteProfile(id: string): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id)
    .select();
  if (error) throw error;
  return data ?? [];
}
