import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('Checking for table "event_types"...');
    const { data, error } = await supabase.from('event_types').select('*').limit(1);
    if (error) {
        console.log('Error accessing event_types:', error.message);
    } else {
        console.log('Success! Table event_types exists.');
        console.log('Sample data:', data);
    }
}

check();
