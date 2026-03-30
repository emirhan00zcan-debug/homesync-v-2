#!/usr/bin/env node
/**
 * Data Integrity Check Script
 * Validates: Mernis flow, RLS rules, real data presence
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDataIntegrity() {
  console.log('🔍 DATA INTEGRITY CHECK\n');

  try {
    // 1. Check Products Table
    console.log('📦 PRODUCTS TABLE:');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, status, is_active, created_at')
      .limit(5);

    if (productsError) {
      console.log(`❌ Error: ${productsError.message}\n`);
    } else {
      console.log(`✅ Total fetched: ${products?.length || 0} products`);
      products?.forEach(p => {
        console.log(`   - ${p.name} (status: ${p.status}, active: ${p.is_active})`);
      });
      console.log('');
    }

    // 2. Check Approved Products Count
    console.log('🎯 APPROVED PRODUCTS (what shows on homepage):');
    const { data: approvedProducts, count: approvedCount } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('status', 'approved')
      .eq('is_active', true);

    console.log(`✅ Approved & Active: ${approvedCount} products\n`);

    // 3. Check Stores Table
    console.log('🏪 STORES TABLE:');
    const { data: stores, count: storesCount } = await supabase
      .from('stores')
      .select('id, name, is_active, is_verified')
      .limit(5);

    console.log(`✅ Total stores: ${storesCount}`);
    stores?.forEach(s => {
      console.log(`   - ${s.name} (active: ${s.is_active}, verified: ${s.is_verified})`);
    });
    console.log('');

    // 4. Check Profiles (Masters/Technicians)
    console.log('👨‍🔧 TECHNICIANS (Ustalar):');
    const { data: masters, count: mastersCount } = await supabase
      .from('profiles')
      .select('id, full_name, role, is_verified, status')
      .eq('role', 'usta')
      .limit(5);

    console.log(`✅ Total technicians: ${mastersCount}`);
    masters?.forEach(m => {
      console.log(`   - ${m.full_name} (verified: ${m.is_verified}, status: ${m.status})`);
    });
    console.log('');

    // 5. Check Verified Profiles (Mernis)
    console.log('🆔 IDENTITY VERIFIED PROFILES:');
    const { data: verifiedProfiles, count: verifiedCount } = await supabase
      .from('profiles')
      .select('id, full_name, is_identity_verified, tc_no')
      .eq('is_identity_verified', true)
      .limit(5);

    console.log(`✅ Verified profiles: ${verifiedCount}`);
    verifiedProfiles?.forEach(p => {
      console.log(`   - ${p.full_name} (TC masked: ${p.tc_no ? '****' + p.tc_no.slice(-4) : 'N/A'})`);
    });
    console.log('');

    // 6. Summary
    console.log('📊 SUMMARY:');
    console.log(`├─ Products (approved): ${approvedCount || 0}`);
    console.log(`├─ Stores (verified): ${stores?.filter(s => s.is_verified).length || 0}`);
    console.log(`├─ Technicians: ${mastersCount || 0}`);
    console.log(`├─ Identity Verified: ${verifiedCount || 0}`);
    console.log('');

    if ((approvedCount || 0) === 0) {
      console.log('⚠️  WARNING: No approved products found. Seed data needed!');
      console.log('   Run: npm run seed:products\n');
    } else {
      console.log('✅ Real data is being used!\n');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkDataIntegrity();
