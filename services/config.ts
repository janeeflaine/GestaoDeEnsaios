import { supabase } from '../supabaseClient';
import type { CongregationCategory, MinistryRole, EventTypeDefinition } from '../types';

export async function fetchCategories(): Promise<CongregationCategory[]> {
  const { data } = await supabase.from('congregation_categories').select('*').order('name');
  return data ?? [];
}

export async function fetchRoles(): Promise<MinistryRole[]> {
  const { data } = await supabase.from('ministry_roles').select('*').order('name');
  return data ?? [];
}

export async function fetchEventTypes(): Promise<EventTypeDefinition[]> {
  const { data } = await supabase.from('event_types').select('*').order('name');
  return data ?? [];
}

export async function insertCategory(name: string) {
  const { error } = await supabase.from('congregation_categories').insert({ name });
  if (error) throw error;
}

export async function updateCategory(id: number, name: string) {
  const { error } = await supabase.from('congregation_categories').update({ name }).eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id: number) {
  const { error } = await supabase.from('congregation_categories').delete().eq('id', id);
  if (error) throw error;
}

export async function insertRole(name: string) {
  const { error } = await supabase.from('ministry_roles').insert({ name });
  if (error) throw error;
}

export async function updateRole(id: number, name: string) {
  const { error } = await supabase.from('ministry_roles').update({ name }).eq('id', id);
  if (error) throw error;
}

export async function deleteRole(id: number) {
  const { error } = await supabase.from('ministry_roles').delete().eq('id', id);
  if (error) throw error;
}

export async function insertEventType(payload: Record<string, unknown>) {
  const { error } = await supabase.from('event_types').insert(payload);
  if (error) throw error;
}

export async function updateEventType(id: number, payload: Record<string, unknown>) {
  const { error } = await supabase.from('event_types').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteEventType(id: number) {
  const { error } = await supabase.from('event_types').delete().eq('id', id);
  if (error) throw error;
}
