import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function testRateLimit() {
    console.log('Testing Identity Verification Rate Limiting...');

    const email = 'test-usta@example.com';
    const password = 'Password123!';

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError) {
        console.error('Login failed:', authError.message);
        return;
    }

    const token = authData.session.access_token;
    const apiUrl = 'http://localhost:3000/api/craftsman/verify-identity';

    async function attemptVerify() {
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                tcKimlikNo: '12345678901',
                ad: 'HATA',
                soyad: 'DENEME',
                dogumYili: '1990'
            })
        });

        const status = res.status;
        const data = await res.json();
        console.log(`Status: ${status}, Response:`, data);
        return status;
    }

    // Try multiple times to trigger rate limit (assuming limit is 5)
    for (let i = 1; i <= 6; i++) {
        console.log(`Attempt ${i}...`);
        const status = await attemptVerify();
        if (status === 429) {
            console.log('✅ Rate limit triggered successfully!');
            break;
        }
    }
}

// Note: This script requires the dev server to be running on localhost:3000
// and a test user with the above credentials to exist.
console.log('Verification script created. Run it while the dev server is active.');
