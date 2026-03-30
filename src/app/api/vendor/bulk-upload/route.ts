import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ProductRow {
    isim: string;
    aciklama?: string;
    fiyat: number;
    stok_adedi: number;
    kategori: string;
    gorsel_url?: string;
}

interface ValidationResult {
    row: number;
    data: ProductRow;
    errors: string[];
}

function validateRows(rows: Record<string, string>[]): { valid: ValidationResult[]; invalid: ValidationResult[] } {
    const valid: ValidationResult[] = [];
    const invalid: ValidationResult[] = [];

    rows.forEach((row, index) => {
        const errors: string[] = [];
        const rowNum = index + 2; // +2 because row 1 is header

        if (!row.isim?.trim()) errors.push('İsim zorunludur');
        if (!row.fiyat) errors.push('Fiyat zorunludur');
        if (isNaN(parseFloat(row.fiyat))) errors.push('Fiyat geçerli bir sayı olmalıdır');
        if (parseFloat(row.fiyat) < 0) errors.push('Fiyat negatif olamaz');
        if (!row.stok_adedi) errors.push('Stok adedi zorunludur');
        if (isNaN(parseInt(row.stok_adedi))) errors.push('Stok adedi tam sayı olmalıdır');
        if (!row.kategori?.trim()) errors.push('Kategori zorunludur');

        const productData: ProductRow = {
            isim: row.isim?.trim() ?? '',
            aciklama: row.aciklama?.trim() || undefined,
            fiyat: parseFloat(row.fiyat) || 0,
            stok_adedi: parseInt(row.stok_adedi) || 0,
            kategori: row.kategori?.trim() ?? '',
            gorsel_url: row.gorsel_url?.trim() || undefined,
        };

        const result: ValidationResult = { row: rowNum, data: productData, errors };
        if (errors.length === 0) valid.push(result);
        else invalid.push(result);
    });

    return { valid, invalid };
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();

        // Auth kontrolü
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

        // Vendor profil + store
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'vendor') {
            return NextResponse.json({ error: 'Sadece satıcılar toplu yükleme yapabilir' }, { status: 403 });
        }

        const { data: store } = await supabase
            .from('stores')
            .select('id')
            .eq('owner_id', user.id)
            .single();

        if (!store) {
            return NextResponse.json({ error: 'Mağaza bulunamadı' }, { status: 404 });
        }

        const body = await req.json();
        const { rows, dryRun = false } = body as { rows: Record<string, string>[]; dryRun: boolean };

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ error: 'Geçerli veri bulunamadı' }, { status: 400 });
        }

        if (rows.length > 500) {
            return NextResponse.json({ error: 'Tek seferde en fazla 500 ürün yüklenebilir' }, { status: 400 });
        }

        const { valid, invalid } = validateRows(rows);

        // Sadece önizleme modu
        if (dryRun) {
            return NextResponse.json({
                preview: true,
                totalRows: rows.length,
                validCount: valid.length,
                invalidCount: invalid.length,
                invalidRows: invalid,
                sample: valid.slice(0, 5).map(v => v.data),
            });
        }

        if (valid.length === 0) {
            return NextResponse.json({ error: 'Yüklenecek geçerli ürün yok', invalidRows: invalid }, { status: 400 });
        }

        // Toplu insert
        const inserts = valid.map(v => ({
            store_id: store.id,
            name: v.data.isim,
            description: v.data.aciklama ?? null,
            price: v.data.fiyat,
            stock_count: v.data.stok_adedi,
            category: v.data.kategori,
            image_url: v.data.gorsel_url ?? null,
            is_active: true,
            status: 'pending',
        }));

        const { error: insertError, data: insertedData } = await supabase
            .from('products')
            .insert(inserts)
            .select('id');

        if (insertError) {
            console.error('[bulk-upload] Insert error:', insertError);
            return NextResponse.json({ error: 'Veritabanına kayıt sırasında hata oluştu', details: insertError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            inserted: insertedData?.length ?? valid.length,
            skipped: invalid.length,
            invalidRows: invalid,
        });
    } catch (e) {
        console.error('[bulk-upload]', e);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
