import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function inspect() {
    console.log('--- Categorias ---');
    const { data: cats, error: e1 } = await supabase.from('congregation_categories').select('*');
    if (e1) console.error('Erro Categorias:', e1.message, e1.code);
    else console.log(JSON.stringify(cats, null, 2));

    console.log('\n--- Cargos ---');
    const { data: roles, error: e2 } = await supabase.from('ministry_roles').select('*');
    if (e2) console.error('Erro Cargos:', e2.message, e2.code);
    else console.log(JSON.stringify(roles, null, 2));
}
inspect();
