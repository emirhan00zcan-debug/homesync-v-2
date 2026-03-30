import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables. Ensure SUPABASE_SERVICE_ROLE_KEY is set in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function promoteToAdmin(email: string) {
    console.log(`Promoting ${email} to ADMIN...`);

    // 1. Get User by Email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error fetching users:', listError.message);
        return;
    }

    const user = users.users.find(u => u.email === email);

    if (!user) {
        console.error(`User with email ${email} not found.`);
        return;
    }

    console.log(`Found user: ${user.id}`);

    // 2. Update metadata
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { user_metadata: { ...user.user_metadata, role: 'ADMIN' } }
    );

    if (updateError) {
        console.error('Error updating user role:', updateError.message);
    } else {
        console.log(`Successfully promoted ${email} to ADMIN!`);
    }
}

const targetEmail = 'emirhan00zcan@gmail.com';
promoteToAdmin(targetEmail);
