import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function checkCongregations() {
    const { data, error } = await supabase
        .from('congregations')
        .select('id, name');

    if (error) {
        console.error('Erro ao acessar congregations:', error.message);
    } else {
        console.log('Congregações encontradas:', data?.length || 0);
        data?.slice(0, 5).forEach(c => console.log(`- ${c.name} (${c.id})`));
    }
}

checkCongregations();
