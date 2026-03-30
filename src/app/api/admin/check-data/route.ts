import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const supabase = createClient();

    // 1. Check Products
    const { data: products, count: productsCount } = await supabase
      .from('products')
      .select('id, name, status, is_active', { count: 'exact' })
      .limit(3);

    // 2. Approved Products
    const { count: approvedCount } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('status', 'approved')
      .eq('is_active', true);

    // 3. Stores
    const { data: stores, count: storesCount } = await supabase
      .from('stores')
      .select('id, name, is_active, is_verified', { count: 'exact' })
      .limit(3);

    // 4. Masters
    const { data: masters, count: mastersCount } = await supabase
      .from('profiles')
      .select('id, full_name, role, is_verified', { count: 'exact' })
      .eq('role', 'usta');

    // 5. Verified Profiles (Mernis)
    const { data: verifiedProfiles, count: verifiedCount } = await supabase
      .from('profiles')
      .select('id, full_name, is_identity_verified, ad, soyad', { count: 'exact' })
      .eq('is_identity_verified', true)
      .limit(5);

    const summary = {
      products: {
        total: productsCount,
        approved: approvedCount,
        samples: products?.map(p => ({ name: p.name, status: p.status, active: p.is_active }))
      },
      stores: {
        total: storesCount,
        verified: stores?.filter(s => s.is_verified).length,
        samples: stores?.map(s => ({ name: s.name, verified: s.is_verified }))
      },
      masters: {
        total: mastersCount,
        verified: masters?.filter(m => m.is_verified).length,
        samples: masters?.map(m => ({ name: m.full_name, verified: m.is_verified }))
      },
      verified_profiles: {
        total: verifiedCount,
        samples: verifiedProfiles?.map(p => ({ name: `${p.ad} ${p.soyad}`, full_name: p.full_name }))
      },
      status: {
        has_real_data: (approvedCount || 0) > 0,
        warning: (approvedCount || 0) === 0 ? 'No approved products found. Consider seeding data.' : null
      }
    };

    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
