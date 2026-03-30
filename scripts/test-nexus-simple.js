const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

async function analyzeSearchIntent(query) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Sen Nexus, bir e-ticaret arama motoru analiz ajanısın. 
            Görevin, kullanıcının girdiği karmaşık veya duygusal arama sorgularını analiz edip, bu sorgunun arkasındaki 'gerçek niyeti' çıkarmaktır.
            
            Kullanıcı Sorgusu: "${query}"
            
            Analiz Kuralları:
            1. Doğrudan kelime eşleşmesi arama; bağlamı, materyali, stili ve kullanım alanını analiz et.
            2. Gelen metni vektör aramasında kullanılacak 3 anahtar kelimeye/kategoriye ayrıştır.
            3. Çıktıyı sadece JSON formatında döndür.
            
            Örnek:
            Sorgu: "Uzay yolculuğunda kullanabileceğim rahat bir şeyler"
            Çıktı: { "keywords": ["minimalist", "fütüristik", "konforlu"], "category": "Akıllı Ev Aksesuarları" }
            
            Lütfen sadece JSON döndür.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error("Failed to parse Nexus intent analysis");
    } catch (error) {
        console.error("Nexus Agent Error:", error);
        return { keywords: [query], category: null };
    }
}

async function testNexus() {
    const testQueries = [
        "Uzay yolculuğunda kullanabileceğim rahat bir şeyler",
        "Modern and warm lighting for a small reading corner",
        "Eczane gibi soğuk değil, loş ve fütüristik bir hava"
    ];

    console.log("--- Nexus Semantic Extraction Test ---");

    for (const query of testQueries) {
        console.log(`\nSorgu: "${query}"`);
        const analysis = await analyzeSearchIntent(query);
        console.log("Nexus Analizi:", JSON.stringify(analysis, null, 2));
    }
}

testNexus().catch(console.error);
