import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Toggle for testing: set to true to use mock Mernis (always returns true)
const USE_MOCK_MERNIS = process.env.NEXT_PUBLIC_MOCK_MERNIS === 'true';
const MERNIS_URL = 'https://tckimlik.nvi.gov.tr/Service/KPSPublic.asmx';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tc_no, first_name, last_name, birth_year, user_id } = body;

        if (!tc_no || !first_name || !last_name || !birth_year) {
            return NextResponse.json({ success: false, error: 'MISSING_PARAMS' }, { status: 400 });
        }

        // Custom Turkish Uppercase - Most robust way to ensure NVI compatibility
        const toUpperTR = (str: string) => {
            return str
                .replace(/i/g, 'İ')
                .replace(/ı/g, 'I')
                .replace(/ğ/g, 'Ğ')
                .replace(/ü/g, 'Ü')
                .replace(/ş/g, 'Ş')
                .replace(/ö/g, 'Ö')
                .replace(/ç/g, 'Ç')
                .toUpperCase()
                .trim();
        };

        const adUpper = toUpperTR(first_name);
        const soyadUpper = toUpperTR(last_name);
        const tcClean = tc_no.toString().trim();
        const yearClean = parseInt(birth_year.toString());

        console.log(`[API-Verify] Data: ${tcClean} | ${adUpper} ${soyadUpper} | ${yearClean}`);

        // SOAP 1.1 Request (strictly formatted)
        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TCKimlikNoDogrula xmlns="http://tckimlik.nvi.gov.tr/WS">
      <TCKimlikNo>${tcClean}</TCKimlikNo>
      <Ad>${adUpper}</Ad>
      <Soyad>${soyadUpper}</Soyad>
      <DogumYili>${yearClean}</DogumYili>
    </TCKimlikNoDogrula>
  </soap:Body>
</soap:Envelope>`;

        // MOCK MODE for testing (when Mernis is unreachable)
        let isValid = false;
        let responseText = '';

        if (USE_MOCK_MERNIS) {
            console.log(`[API-Verify] 🔄 MOCK MODE ENABLED - Always returning true`);
            isValid = true;
            responseText = '<TCKimlikNoDogrulaResult>true</TCKimlikNoDogrulaResult>';
        } else {
            // REAL MERNIS API
            const response = await fetch(MERNIS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': '"http://tckimlik.nvi.gov.tr/WS/TCKimlikNoDogrula"',
                },
                body: soapEnvelope,
            });

            responseText = await response.text();
            console.log(`[API-Verify] Status: ${response.status}`);

            if (!response.ok || responseText.includes('<html') || responseText.includes('WAF')) {
                console.warn('[API-Verify] Blocked or error response');
                return NextResponse.json({
                    success: false,
                    error: 'SERVICE_UNAVAILABLE',
                    message: 'Nüfus Müdürlüğü servisine şu an ulaşılamıyor (Sunucu lokasyonu kısıtlaması veya Firewall). Mock mode'u test etmek için NEXT_PUBLIC_MOCK_MERNIS=true ayarlayın.'
                }, { status: 503 });
            }

            // Namespace-Agnostic Parsing: Handles <TCKimlikNoDogrulaResult> or <a:TCKimlikNoDogrulaResult>
            const resultMatch = responseText.match(/<[^>:]*TCKimlikNoDogrulaResult[^>]*>([^<]+)<\/[^>:]*TCKimlikNoDogrulaResult>/i);

            if (!resultMatch) {
                console.error('[API-Verify] Parse Failed. Full Resp:', responseText.substring(0, 300));
                return NextResponse.json({
                    success: false,
                    error: 'PARSING_ERROR',
                    message: 'Doğrulama sonucu işlenemedi. Servisten geçersiz yanıt alındı.'
                });
            }

            isValid = resultMatch[1].trim().toLowerCase() === 'true';
            console.log(`[API-Verify] Match Result: ${isValid}`);
        }

        if (isValid && user_id) {
            const supabase = createClient();
            await supabase
                .from('profiles')
                .update({
                    is_identity_verified: true,
                    ad: adUpper,
                    soyad: soyadUpper,
                    tc_no: tcClean,
                    dogum_yili: yearClean
                })
                .eq('id', user_id);
        }

        return NextResponse.json({
            success: isValid,
            error: isValid ? null : 'INVALID_IDENTITY'
        });

    } catch (error) {
        console.error('[API-Verify] Fatal Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Sunucu hatası',
            message: 'Sistemsel bir hata oluştu veya Nüfus Müdürlüğü servisine erişilemedi.'
        }, { status: 500 });
    }
}
