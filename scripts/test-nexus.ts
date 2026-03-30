import { analyzeSearchIntent } from './src/lib/ai/nexus';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

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
