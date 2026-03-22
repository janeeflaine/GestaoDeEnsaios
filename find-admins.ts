import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function findAdmins() {
    const { data, error } = await supabase
        .from('profiles')
        .select('email, name, role')
        .eq('role', 'ADMIN');

    if (error) {
        console.error('Erro ao buscar admins:', error.message);
    } else {
        console.log('Usuários ADMIN encontrados:', data);
    }
}

findAdmins();
