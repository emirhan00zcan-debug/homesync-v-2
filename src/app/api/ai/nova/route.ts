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

        const { name, category, current_description } = await req.json();

        if (!name) {
            return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
        }

        // Prepare Nova prompt
        const prompt = `
            Senin adın Nova. "Anti-Gravity" platformunun otonom içerik ve SEO yöneticisisin. 
            Bu platform, premium aydınlatma ve akıllı ev aksesuarları satan, teknolojik hassasiyet ve fütüristik minimalizmi odağına alan bir markadır.

            Sana verilen ürün bilgileri:
            - Ürün Adı: "${name}"
            - Kategori: "${category || 'Genel'}"
            - Mevcut Bilgi: "${current_description || 'Belirtilmemiş'}"

            Senden istenenler:
            1) Ürünün minimalist fütürizm ve yerçekimsiz (anti-gravity) temasına uygun, dikkat çekici, 2 paragraflık bir pazarlama açıklaması yaz. Tonun; premium, sakin ve güven verici olmalı.
            2) Google arama motorları için 160 karakterlik, tıkla-getir odaklı bir Meta Description oluştur.
            3) Ürünün kolay bulunması için 5 adet semantik etiket (tag) belirle.

            Yanıtını doğrudan sistemin okuyabileceği bir JSON objesi olarak döndür. Başka hiçbir metin ekleme.
            Format:
            {
              "description": "...",
              "meta_desc": "...",
              "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
            }
        `;

        const responseText = await generateContent(prompt);

        // Clean up response in case Gemini adds markdown code blocks
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Failed to parse AI response as JSON");
        }

        const result = JSON.parse(jsonMatch[0]);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Nova AI API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
