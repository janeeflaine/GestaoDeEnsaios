import { createClient } from '@supabase/supabase-js';

const metaEnv = import.meta.env as Record<string, string | undefined>;
const processEnv = (typeof process !== 'undefined' ? process.env : {}) as Record<string, string | undefined>;

const getEnv = (key: string): string =>
    metaEnv[key] ?? processEnv[key] ?? '';

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ ERRO CRÍTICO: Variáveis do Supabase não encontradas!');
    console.error('Ambiente detectado:', {
        urlFound: !!supabaseUrl,
        keyFound: !!supabaseAnonKey,
        mode: metaEnv['MODE'],
    });
}

export const supabase = createClient(
    supabaseUrl || 'https://missing-url.supabase.co',
    supabaseAnonKey || 'missing-key'
);
