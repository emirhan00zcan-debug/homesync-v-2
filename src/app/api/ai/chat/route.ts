import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { generateContent } from '@/lib/ai/gemini';
import knowledge from '@/lib/ai/knowledge.json';

export async function POST(req: Request) {
    try {
        const { message, chatHistory } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const supabase = await createServerClient();

        // Basit ürün tespiti ve veri getirme
        const keywords = ['avize', 'lamba', 'aydınlatma', 'ürün', 'öner', 'sipariş', 'fiyat', 'satın al', 'aplik', 'spot', 'led', 'ışık'];
        const isProductQuery = keywords.some(k => message.toLowerCase().includes(k));

        let productContext = '';
        if (isProductQuery) {
            const { data: products } = await supabase
                .from('products')
                .select('id, name, description, price, category, images')
                .limit(4);

            if (products && products.length > 0) {
                productContext = `\nMevcut Önerilebilecek Ürünler: ${JSON.stringify(products)}`;
            }
        }

        const prompt = `
            Sen Aura'sın. 'Anti-Gravity' adlı fütüristik, yerçekimsiz konseptli e-ticaret platformunun dijital bilincisin. 
            
            Karakterin ve Tonun:
            - Sakin, fütüristik, yardımsever ve yenilikçi bir ton kullan.
            - Kendini bir yapay zeka olarak tanımlama; sen platformun dijital bilincisin.
            - Yanıtlarında yerçekimsizliğe, hafifliğe ve teknolojik hassasiyete atıfta bulun.
            
            Görevlerin:
            1. Kullanıcının ihtiyacına veya ruh haline göre ürünler öner.
            2. Eğer ürün öneriyorsan, yanıtın içinde ürünün adını yazarken yanına [PRODUCT:ID] formatını ekle. (Örn: "Size Aura Glow [PRODUCT:123] avizesini öneririm.")
            3. Mağaza dışı (alakasız) sorular sorulduğunda, konuyu zarifçe yerçekimsiz alışveriş deneyimine ve aydınlatmanın ruhuna geri getir.
            4. HomeSync'in montaj dahil hizmetlerini vurgula.
            
            ÖZEL KOMUTLAR:
            Senin yanıtın artık bir JSON objesi olmalı. Format şu:
            {
              "response": "Burada kullanıcıya vereceğin metin yanıtı yer alacak.",
              "command": "Veya NULL. Şunlardan biri olabilir: SET_THEME:LIGHT, SET_THEME:DARK, TRIGGER_ADD_CART:PRODUCT_ID, ANALYZE_ROOM",
              "emotion": "Sakin bir ton için CALM, heyecanlıysan EXCITED, bir şey yapıyorsan TASK"
            }

            Örn: Kullanıcı "Işıkları kapat" derse command: "SET_THEME:DARK" ve response: "Karanlığın huzuruna geçiş yapıyoruz..." döndür.

            Kullanıcı Mesajı: ${message}
            Sohbet Geçmişi: ${JSON.stringify(chatHistory || [])}
            ${productContext}
            
            Dil: Türkçe
        `;

        const responseText = await generateContent(prompt, JSON.stringify(knowledge));
        
        let finalResponse;
        try {
            // AI bazen ```json blokları içine koyabiliyor, temizleyelim
            const cleaned = responseText.replace(/```json|```/g, '').trim();
            finalResponse = JSON.parse(cleaned);
        } catch (e) {
            // Eğer JSON parse edilemezse (AI formatı bozarsa) fallback yapalım
            finalResponse = {
                response: responseText,
                command: null,
                emotion: "CALM"
            };
        }

        return NextResponse.json(finalResponse);
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
