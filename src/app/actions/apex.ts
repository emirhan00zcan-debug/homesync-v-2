"use server";

import { createClient } from '@/lib/supabase/server';

export interface ApexReportItem {
    id: string;
    title: string;
    description: string;
    urgency: 'high' | 'medium' | 'low';
    category: 'stock' | 'conversion' | 'strategy';
}

export async function getApexAnalysis(): Promise<ApexReportItem[]> {
    const supabase = createClient();

    // Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString();

    try {
        // Fetch data in parallel
        const [
            ordersRes,
            activityRes,
            stockRes,
            popularRes
        ] = await Promise.all([
            // 7 day orders
            supabase.from('orders').select('id, total_amount, created_at, status').gte('created_at', dateStr),
            // 7 day activity (checkouts)
            supabase.from('user_activity').select('activity_type, created_at').gte('created_at', dateStr),
            // Critical stock (e.g. less than 10)
            supabase.from('products').select('id, name, stock_count, view_count').lt('stock_count', 10).eq('is_active', true),
            // Recently popular products (dummy popularity measure: high views)
            supabase.from('products').select('id, name, view_count, stock_count').order('view_count', { ascending: false }).limit(5)
        ]);

        const reports: ApexReportItem[] = [];

        // 1. Critical Stock Logic
        const criticalProducts = stockRes.data || [];
        const popularButLowStock = criticalProducts.filter(p => p.view_count > 50); // Arbitrary popularity threshold

        if (popularButLowStock.length > 0) {
            const topCritical = popularButLowStock[0];
            reports.push({
                id: 'stock-alert',
                title: 'KRİTİK STOK UYARISI',
                description: `${topCritical.name} ürünü yoğun ilgi görmesine rağmen stokta sadece ${topCritical.stock_count} adet kaldı. İkmal süreci başlatılmalı.`,
                urgency: 'high',
                category: 'stock'
            });
        } else {
            reports.push({
                id: 'stock-ok',
                title: 'STOK DURUMU STABİL',
                description: 'Son 7 günde trending olan ürünlerin stok seviyeleri operasyonel sınırların üzerinde seyrediyor.',
                urgency: 'low',
                category: 'stock'
            });
        }

        // 2. Conversion/Anomaly Logic
        const activities = activityRes.data || [];
        const checkouts = activities.filter(a => a.activity_type === 'checkout_start').length;
        const successes = activities.filter(a => a.activity_type === 'checkout_success').length;

        // Mock drop detection if data is sparse, or real calculation
        const conversionRate = checkouts > 0 ? (successes / checkouts) : 1;

        if (conversionRate < 0.6 && checkouts > 5) {
            reports.push({
                id: 'conversion-anomaly',
                title: 'DÖNÜŞÜM ANOMALİSİ',
                description: 'Ödeme adımı başlangıcı ile tamamlanması arasında %40+ düşüş tespit edildi. Iyzico/Stripe entegrasyonu kontrol edilmeli.',
                urgency: 'high',
                category: 'conversion'
            });
        } else {
            reports.push({
                id: 'conversion-healthy',
                title: 'DÖNÜŞÜM DENGELİ',
                description: 'Ödeme akışında teknik bir darboğaz gözlemlenmedi. Mevcut dönüşüm oranları platform ortalamasında.',
                urgency: 'low',
                category: 'conversion'
            });
        }

        // 3. Strategic Recommendation
        const totalRevenue = ordersRes.data?.reduce((acc, o) => acc + Number(o.total_amount), 0) || 0;

        if (totalRevenue < 5000) {
            reports.push({
                id: 'strategy-growth',
                title: 'STRATEJİK ÖNERİ: AGGRESSİVE BUNDLING',
                description: 'Düşük ciro periyodunda "Professional Installation Included" vurgusuyla sepet ortalamasını %20 artıracak bundle kampanyası önerilir.',
                urgency: 'medium',
                category: 'strategy'
            });
        } else {
            reports.push({
                id: 'strategy-retention',
                title: 'STRATEJİK ÖNERİ: SADAKAT PROGRAMI',
                description: 'Yüksek hacimli bu haftada, ilk alışverişini yapan kullanıcılar için "Gravity-Free" geri dönüş kuponları tanımlanması tavsiye edilir.',
                urgency: 'medium',
                category: 'strategy'
            });
        }

        return reports.slice(0, 3); // Ensure exactly 3 as requested

    } catch (error) {
        console.error('Apex Analysis Error:', error);
        return [
            {
                id: 'error',
                title: 'ANALİZ HATASI',
                description: 'Veri madenciliği sırasında bir hata oluştu. Lütfen bağlantı ayarlarını kontrol edin.',
                urgency: 'high',
                category: 'strategy'
            }
        ];
    }
}
