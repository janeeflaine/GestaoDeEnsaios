import { createClient } from '@supabase/supabase-js';
import { INITIAL_EVENTS, INITIAL_CONDUCTORS, INITIAL_CONGREGATIONS } from './constants';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERRO: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontrados no .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrate() {
    console.log('Iniciando migração...');

    // 1. Migrar Condutores
    console.log('Migrando encarregados...');
    for (const cond of INITIAL_CONDUCTORS) {
        const { error } = await supabase.from('conductors').upsert({
            id: cond.id,
            name: cond.name,
            age: cond.age,
            instrument: cond.instrument,
            congregation: cond.congregation,
            photo_url: cond.photoUrl,
            type: cond.type
        });
        if (error) console.error(`Erro ao inserir condutor ${cond.name}:`, error.message);
    }

    // 2. Migrar Congregações
    console.log('Migrando congregações...');
    for (const cong of INITIAL_CONGREGATIONS) {
        const { error: congError } = await supabase.from('congregations').upsert({
            id: cong.id,
            name: cong.name,
            category: cong.category,
            address: cong.address,
            cep: cong.cep,
            city: cong.city,
            state: cong.state
        });
        if (congError) {
            console.error(`Erro ao inserir congregação ${cong.name}:`, congError.message);
            continue;
        }

        // Migrar Dias de Culto
        for (const service of cong.serviceDays) {
            await supabase.from('service_days').insert({
                congregation_id: cong.id,
                day: service.day,
                time: service.time
            });
        }

        // Migrar Ministério
        for (const min of cong.ministry) {
            await supabase.from('ministry').insert({
                congregation_id: cong.id,
                role: min.role,
                name: min.name
            });
        }
    }

    // 3. Migrar Eventos
    console.log('Migrando eventos...');
    for (const event of INITIAL_EVENTS) {
        const { error } = await supabase.from('events').upsert({
            id: event.id,
            month: event.month,
            day: event.day,
            full_date: event.fullDate.toISOString(),
            location: event.location,
            time: event.time,
            conductor: event.conductor,
            type: event.type,
            canceled: event.canceled || false
        });
        if (error) console.error(`Erro ao inserir evento ${event.location}:`, error.message);
    }

    console.log('Migração concluída com sucesso!');
}

migrate().catch(err => {
    console.error('Erro fatal durante a migração:', err);
    process.exit(1);
});
