import { NextResponse } from 'next/server';
import { MernisService } from '@/lib/services/mernis';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { tcKimlikNo, ad, soyad, dogumYili } = body;

        if (!tcKimlikNo || !ad || !soyad || !dogumYili) {
            return NextResponse.json({ error: 'Eksik bilgi girdiniz.' }, { status: 400 });
        }

        // Pre-registration verification (Public)
        // Note: In a production environment, you might want to add some basic rate limiting here 
        // linked to IP or a temporary session.

        const mernisResult = await MernisService.verifyIdentity({
            tcKimlikNo,
            ad,
            soyad,
            dogumYili: Number(dogumYili)
        });

        if (mernisResult.success) {
            return NextResponse.json({
                success: true,
                message: 'Kimlik doğrulama başarılı.'
            });
        } else if (mernisResult.error === 'SERVICE_UNAVAILABLE' || mernisResult.error === 'PARSING_ERROR') {
            return NextResponse.json({
                success: false,
                error: mernisResult.error,
                message: 'Nüfus Müdürlüğü servisine şu an ulaşılamıyor. Lütfen daha sonra tekrar deneyin.'
            }, { status: 503 });
        } else {
            return NextResponse.json({
                success: false,
                error: 'INVALID_IDENTITY',
                message: 'Bilgileriniz Nüfus Müdürlüğü kayıtlarıyla eşleşmiyor.'
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error('API Public Verify Identity Error:', error);
        return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
    }
}
