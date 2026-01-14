import { createClient } from '@supabase/supabase-js';
// Tenta pegar de vários lugares (Vite, Process, etc)
const getEnv = (key: string) => {
    return (import.meta as any).env?.[key] || (process as any).env?.[key] || '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ ERRO CRÍTICO: Variáveis do Supabase não encontradas!');
    console.log('Ambiente detectado:', {
        urlFound: !!supabaseUrl,
        keyFound: !!supabaseAnonKey,
        mode: (import.meta as any).env?.MODE
    });
}

export const supabase = createClient(
    supabaseUrl || 'https://missing-url.supabase.co',
    supabaseAnonKey || 'missing-key'
);
