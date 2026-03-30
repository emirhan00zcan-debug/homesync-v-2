import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Determine if we have an API key
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const imageFile = formData.get('image') as File | null;

        if (!imageFile) {
            return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
        }

        // If no API key, return a mock response after a short delay to simulate AI
        if (!genAI) {
            console.warn("GEMINI_API_KEY is missing. Returning simulated AI response.");
            await new Promise(resolve => setTimeout(resolve, 2000));
            return NextResponse.json({
                success: true,
                analysis: {
                    package_name: "Kozmik Zerafet Seçkisi",
                    style: "Modern Minimalist",
                    colors: ["Beyaz", "Ahşap", "Antrasit"],
                    recommended_keywords: ["sarkıt", "led", "modern", "siyah"],
                    description: "Eklediğiniz oda tasarımı modern çizgilere sahip. Minimalist bir aydınlatma armatürü veya siyah detaylı bir sarkıt lamba bu mekana derinlik katacaktır."
                }
            });
        }

        // Convert the file to the format Gemini expects
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Sen üst düzey bir iç tasarımcı ve aydınlatma uzmanısın. Sana bir odanın fotoğrafı verilecek.
Lütfen odayı analiz et ve aşağıdaki JSON formatında cevap ver (sadece JSON, ekstra metin ekleme):
{
  "package_name": "Bu oda için önerilen aydınlatma konseptini temsil eden büyüleyici, pazarlamaya uygun 3-4 kelimelik bir paket ismi (örn: Modern Kozmik Işıltı Paketi)",
  "style": "Odanın genel stili (örn: Modern, İskandinav, Klasik vb.)",
  "colors": ["hakim renk 1", "hakim renk 2"],
  "recommended_keywords": ["aydınlatma türü önerisi (örn: sarkıt, aplik, lambader)", "renk önerisi"],
  "description": "Seçilen ürünlerin odaya neden uygun olduğuna dair 1-2 cümlelik profesyonel, sıcak ve lüks hissettiren bir açıklama."
}`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: imageFile.type
                }
            }
        ]);

        const responseText = result.response.text();
        
        // Clean up formatting exactly if model wraps it in markdown codeblocks
        const cleanedText = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        
        const analysis = JSON.parse(cleanedText);

        return NextResponse.json({
            success: true,
            analysis
        });

    } catch (error) {
        console.error('AI Stylist Error:', error);
        return NextResponse.json(
            { error: 'Görsel analiz edilirken bir hata oluştu.', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
