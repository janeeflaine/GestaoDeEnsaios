import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
    const tables = ['events', 'conductors', 'congregations', 'service_days', 'ministry', 'presences', 'profiles'];
    console.log('--- Verificação de Tabelas ---');

    for (const table of tables) {
        const { error } = await supabase.from(table).select('*', { count: 'exact', head: true }).limit(1);

        if (error) {
            if (error.code === 'PGRST116' || error.message.includes('relation "' + table + '" does not exist')) {
                console.log(`❌ Tabela "${table}": NÃO EXISTE`);
            } else {
                console.log(`⚠️ Tabela "${table}": ERRO (${error.message})`);
            }
        } else {
            console.log(`✅ Tabela "${table}": EXISTE`);
        }
    }
}

checkTables();
