import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectProfiles() {
    console.log('--- Inspeção de "profiles" ---');

    // Tenta buscar um registro
    const { data: selectData, error: selectError } = await supabase.from('profiles').select('*').limit(1);

    if (selectError) {
        console.log('❌ Erro no SELECT:', selectError.message);
        console.log('Código do Erro:', selectError.code);
    } else {
        console.log('✅ Tabela acessível via SELECT.');
        console.log('Amostra de dados:', JSON.stringify(selectData));
    }

    // Tenta descobrir as colunas via um filtro que não retorna nada
    const { data: columnsData, error: columnsError } = await supabase.from('profiles').select('id, name').limit(0);
    if (columnsError) {
        console.log('❌ Erro ao acessar colunas id, name:', columnsError.message);
    } else {
        console.log('✅ Colunas id, name são válidas.');
    }
}

inspectProfiles();
