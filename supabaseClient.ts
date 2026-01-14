import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ ERRO CRÍTICO: Variáveis do Supabase não encontradas! Verifique o painel da Vercel.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
