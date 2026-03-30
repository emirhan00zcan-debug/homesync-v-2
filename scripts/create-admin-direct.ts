import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdminUser(email: string) {
    console.log(`Creating user ${email} directly via Admin API...`);

    // Create user with confirmed email and password
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: 'Password123!', // User should change this later
        email_confirm: true,
        user_metadata: { role: 'ADMIN', full_name: 'Admin User' }
    });

    if (createError) {
        if (createError.message.includes('already registered')) {
            console.log('User already exists, attempting to promote...');
            // If user already exists, we find them and update
            const { data: users } = await supabase.auth.admin.listUsers();
            const existingUser = users?.users.find(u => u.email === email);
            if (existingUser) {
                await supabase.auth.admin.updateUserById(existingUser.id, {
                    user_metadata: { ...existingUser.user_metadata, role: 'ADMIN' }
                });
                console.log('Successfully promoted existing user to ADMIN.');
            }
        } else {
            console.error('Error creating user:', createError.message);
        }
    } else {
        console.log(`Successfully created and promoted ${email}!`);
        console.log('Temporary Password: Password123!');
    }
}

const targetEmail = 'emirhan00zcan@gmail.com';
createAdminUser(targetEmail);
