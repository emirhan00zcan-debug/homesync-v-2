import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function seed() {
    console.log('--- Seeding Demo Store ---');

    // 1. Find a vendor user (or just use an existing user id if known, but safer to find one)
    const { data: profiles, error: pError } = await supabase.from('profiles').select('id, full_name').limit(1);

    if (pError || !profiles || profiles.length === 0) {
        console.error('No users found in profiles table to assign store.');
        return;
    }

    const ownerId = profiles[0].id;

    // 2. Insert store
    const { data: store, error: sError } = await supabase.from('stores').insert({
        owner_id: ownerId,
        name: 'HomeSync Premium Shop',
        slug: 'homesync-premium',
        description: 'Geleceğin aydınlatma teknolojileri burada. Modern tasarımlar ve akıllı çözümler.',
        logo_url: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=200&h=200&fit=crop',
        banner_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1200&h=400&fit=crop',
        is_active: true,
        is_verified: true
    }).select().single();

    if (sError) {
        if (sError.code === '23505') {
            console.log('Demo store already exists or owner already has a store.');
        } else {
            console.error('Error seeding store:', sError.message);
        }
    } else {
        console.log('✅ Demo store created successfully:', store.name);

        // 3. Link to profile
        await supabase.from('profiles').update({ store_id: store.id }).eq('id', ownerId);
    }
}

seed();
