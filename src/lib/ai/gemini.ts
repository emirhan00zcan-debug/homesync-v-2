import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
    console.warn("GOOGLE_GENERATIVE_AI_API_KEY is not set. AI features might not work.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function generateContent(prompt: string, context?: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const fullPrompt = context
            ? `Context: ${context}\n\nTask: ${prompt}`
            : prompt;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw new Error(error.message || "Failed to generate content from Gemini");
    }
}
