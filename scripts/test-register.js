const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jizdsvcgywghinzckjdc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppemRzdmNneXdnaGluemNramRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNzExMDEsImV4cCI6MjA4NzY0NzEwMX0.EWec-fhv7fUepY-afZOeCHJ-1Lg45cUMeXAutO1rfic';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRegister() {
    const { data, error } = await supabase.auth.signUp({
        email: 'test_user_' + Date.now() + '@gmail.com',
        password: 'password123',
        options: {
            data: {
                name: 'Test Technician',
                role: 'TECHNICIAN'
            }
        }
    });

    if (error) {
        fs.writeFileSync('error.json', JSON.stringify(error, null, 2));
    } else {
        fs.writeFileSync('success.json', JSON.stringify(data, null, 2));
    }
}

testRegister();
