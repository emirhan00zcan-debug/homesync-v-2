/**
 * Mernis (KPSPublic) SOAP Service Integration
 * Documentation: https://tckimlik.nvi.gov.tr/Service/KPSPublic.asmx
 */

export interface MernisVerifyRequest {
    tcKimlikNo: string;
    ad: string;
    soyad: string;
    dogumYili: number;
}

export interface MernisVerifyResponse {
    success: boolean;
    error?: 'SERVICE_UNAVAILABLE' | 'INVALID_RESPONSE' | 'PARSING_ERROR';
}

export class MernisService {
    private static readonly SOAP_URL = 'https://tckimlik.nvi.gov.tr/Service/KPSPublic.asmx';

    /**
     * T.C. Kimlik numarasını doğrular.
     */
    static async verifyIdentity(req: MernisVerifyRequest): Promise<MernisVerifyResponse> {
        // Robust TR Uppercase and trim
        const formatTR = (str: string) => {
            if (!str) return '';
            return str
                .trim()
                .replace(/i/g, 'İ')
                .replace(/ı/g, 'I')
                .toLocaleUpperCase('tr-TR');
        };

        const adUpper = formatTR(req.ad);
        const soyadUpper = formatTR(req.soyad);

        // Ensure exact data types for NVI to prevent SOAP schema faults
        const tcNo = parseInt(req.tcKimlikNo.trim(), 10);
        const yil = parseInt(req.dogumYili.toString(), 10);

        // SOAP 1.1 Envelope is generally more stable for KPSPublic
        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TCKimlikNoDogrula xmlns="http://tckimlik.nvi.gov.tr/WS">
      <TCKimlikNo>${tcNo}</TCKimlikNo>
      <Ad>${adUpper}</Ad>
      <Soyad>${soyadUpper}</Soyad>
      <DogumYili>${yil}</DogumYili>
    </TCKimlikNoDogrula>
  </soap:Body>
</soap:Envelope>`;

        try {
            console.log(`[Mernis Request] TC:${req.tcKimlikNo}, Ad:${adUpper}, Soyad:${soyadUpper}, Yil:${req.dogumYili}`);

            const response = await fetch(this.SOAP_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': '"http://tckimlik.nvi.gov.tr/WS/TCKimlikNoDogrula"',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                },
                body: soapEnvelope,
                cache: 'no-store'
            });

            const responseText = await response.text();

            if (!response.ok) {
                // Log the raw and complete error response (HTML/XML) as requested
                console.error(`[Mernis RAW ERROR] Status: ${response.status}`, responseText);
                return { success: false, error: 'SERVICE_UNAVAILABLE' };
            }

            // Log the raw and complete success response
            console.log(`[Mernis RAW SUCCESS]:`, responseText);

            // XML Parse via Regex
            const match = responseText.match(/<TCKimlikNoDogrulaResult>(true|false|True|False)<\/TCKimlikNoDogrulaResult>/);

            if (match && match[1]) {
                const isValid = match[1].toLowerCase() === 'true';
                console.log(`[Mernis Result for ${req.tcKimlikNo}]:`, isValid);
                return { success: isValid };
            }

            console.error('[Mernis Response Parsing Failed]: Could not find TCKimlikNoDogrulaResult in XML');
            return { success: false, error: 'PARSING_ERROR' };
        } catch (error) {
            // Log full exception details
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('[Mernis RAW EXCEPTION]:', errorMessage);
            return { success: false, error: 'SERVICE_UNAVAILABLE' };
        }
    }
}
