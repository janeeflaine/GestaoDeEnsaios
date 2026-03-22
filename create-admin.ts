import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function createAdmin() {
    console.log('Tentando criar usuário gestor@ccb.com...');
    const { data, error } = await supabase.auth.signUp({
        email: 'gestor@ccb.com',
        password: 'adminpassword123',
        options: {
            data: {
                name: 'Administrador do Sistema',
                instrument: 'Nenhum',
                role: 'ADMIN' // This exploits the COALESCE logic in handle_new_user()
            }
        }
    });

    if (error) {
        console.error('Erro ao criar usuário:', error.message);
    } else {
        console.log('Usuário admin criado com sucesso!');
        console.log('User ID:', data.user?.id);
        if (data.session) {
            console.log('Sessão iniciada (Email confirmations offset).');
        } else {
            console.log('Email confirmations podem estar ativadas no painel do Supabase. Verifique seu email ou o painel.');
        }
    }
}

createAdmin();
