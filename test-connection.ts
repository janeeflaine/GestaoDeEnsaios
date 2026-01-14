import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ ERRO: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontrados no .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('🔍 Testando conexão com Supabase...');
    console.log('URL:', supabaseUrl);

    try {
        // Tenta buscar as tabelas (ou qualquer dado básico)
        const { data, error } = await supabase.from('events').select('count', { count: 'exact', head: true });

        if (error) {
            // Se o erro for que a tabela não existe, a conexão FOI estabelecida, mas o schema falta.
            if (error.code === 'PGRST116' || error.message.includes('relation "events" does not exist')) {
                console.log('✅ Conexão estabelecida com sucesso!');
                console.log('⚠️ Aviso: A tabela "events" ainda não foi criada. Lembre-se de rodar o schema no SQL Editor.');
            } else {
                console.error('❌ Erro na conexão:', error.message);
            }
        } else {
            console.log('✅ Conexão estabelecida com sucesso!');
            console.log('📊 Tabelas prontas para uso.');
        }
    } catch (err) {
        console.error('❌ Erro fatal:', err);
    }
}

testConnection();
