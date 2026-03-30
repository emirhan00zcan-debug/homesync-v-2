import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

/**
 * Nexus Agent: Semantic Search Analyzer
 * Analyzes complex or emotional user queries to extract search intent.
 */
export async function analyzeSearchIntent(query: string) {
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

        // Clean the response from markdown code blocks if present
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error("Failed to parse Nexus intent analysis");
    } catch (error: any) {
        console.error("Nexus Agent Error:", error);
        return { keywords: [query], category: null }; // Fallback to raw query
    }
}

/**
 * Generates an embedding for a piece of text (e.g., product description or search intent).
 * Note: Since we don't have a direct embedding tool in this environment, 
 * we will use a placeholder or prompt Gemini to behave as an embedding generator if needed, 
 * but for the Nexus task requirement (3 keywords extraction), we will focus on the text analysis.
 */
export async function getEmbedding(text: string) {
    // This is a placeholder as full vector search usually requires a dedicated embedding model.
    // For this specific task, if pgvector is used, we'd call OpenAI or Google Embedding API here.
    return null;
}
