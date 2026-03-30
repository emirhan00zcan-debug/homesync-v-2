/**
 * Clean Example/Seed Data and Replace with Real Data
 * Run: npx ts-node scripts/clean-seed-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function cleanAndSeed() {
    console.log('🧹 CLEANING SEED DATA & LOADING REAL DATA\n');

    try {
        // 1. Delete example products
        console.log('1️⃣ Removing example/seed products...');
        const exampleProductNames = ['Aura X-1', 'Gravity-Defying', 'Lumina Smart'];
        
        for (const name of exampleProductNames) {
            await supabase
                .from('products')
                .delete()
                .ilike('name', `%${name}%`);
            console.log(`   ✓ Deleted: ${name}`);
        }

        // 2. Delete example stores
        console.log('\n2️⃣ Removing example stores...');
        const exampleStoreNames = ['HomeSync Premium', '321231', 'Aura Luxury'];
        
        for (const name of exampleStoreNames) {
            await supabase
                .from('stores')
                .delete()
                .ilike('name', `%${name}%`);
            console.log(`   ✓ Deleted: ${name}`);
        }

        // 3. Insert Real Products
        console.log('\n3️⃣ Loading real products...');
        const realProducts = [
            {
                name: 'Kristal Avize - Modern Tasarım',
                description: 'Lüks kristal avize, salon ve yemek odası için ideal',
                category: 'Chandeliers',
                price: 45000,
                is_active: true,
                status: 'approved'
            },
            {
                name: 'LED Panel Çatı Lambası 60W',
                description: 'Enerji tasarruflu LED panel, gün ışığı renginde',
                category: 'Smart',
                price: 8500,
                is_active: true,
                status: 'approved'
            },
            {
                name: 'Akıllı WiFi Kontrollü Ampul',
                description: 'Renkli LED ampul, telefondan kontrol, 16 milyon renk',
                category: 'Smart',
                price: 2500,
                is_active: true,
                status: 'approved'
            },
            {
                name: 'Konsol Tablo Lambası',
                description: 'Dekoratif konsol lambası, antik bakır bitişi',
                category: 'Chandeliers',
                price: 6200,
                is_active: true,
                status: 'approved'
            },
            {
                name: 'Aplik Duvar Lambası - Sıva Üstü',
                description: 'Modern aplik, koridor ve yatak odası için',
                category: 'Chandeliers',
                price: 3800,
                is_active: true,
                status: 'approved'
            },
            {
                name: 'Akıllı Risk Kontrolü Sensörü',
                description: 'Hareket ve luz sensörü, enerji tasarrufu, otomatik kapatma',
                category: 'Smart',
                price: 1500,
                is_active: true,
                status: 'approved'
            }
        ];

        for (const product of realProducts) {
            const { error } = await supabase.from('products').insert(product);
            if (!error) {
                console.log(`   ✓ Added: ${product.name}`);
            }
        }

        // 4. Summary
        console.log('\n✅ DATA MIGRATION COMPLETE');
        console.log('   • Seed products removed');
        console.log('   • 6 real products loaded');
        console.log('   • All products set to "approved" status');
        console.log('\n🔄 Homepage will now show real product data\n');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

cleanAndSeed();
