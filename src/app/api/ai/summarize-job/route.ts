import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/ai/gemini';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { description } = await req.json();

        if (!description) {
            return NextResponse.json({ error: 'Description is required' }, { status: 400 });
        }

        // Prepare prompt
        const prompt = `
            Aşağıdaki metin bir müşterinin evindeki arıza veya ihtiyaç duyduğu montaj hizmeti hakkında yazdığı uzun ve karmaşık bir açıklamadır.
            Senin görevin bu açıklamayı okuyup, bir ustanın (tesisatçı, elektrikçi, mobilyacı vb.) hızlıca anlayabileceği şekilde, YAPILACAK İŞİ özetleyen TEK BİR CÜMLEYE dönüştürmendir.
            
            Örnek:
            Müşteri: "Ya mutfaktaki dolabın menteşesi koptu, dün akşam eşim açarken elinde kaldı. Bir de sağdaki kapak tam kapanmıyor düşecek gibi."
            Özet: "Mutfak dolabı kopan menteşe değişimi ve kapak ayarı."
            
            Müşteri Metni: "${description}"
            
            Sadece özeti yaz, başka bir açıklama ekleme.
        `;

        const summary = await generateContent(prompt);

        return NextResponse.json({ summary });
    } catch (error: any) {
        console.error('AI Summarize Job API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
