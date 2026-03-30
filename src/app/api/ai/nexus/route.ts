import { NextResponse } from 'next/server';
import { analyzeSearchIntent } from '@/lib/ai/nexus';

/**
 * API Route for Nexus Semantic Search Agent
 */
export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        const NexusAnalysis = await analyzeSearchIntent(query);

        return NextResponse.json({
            originalQuery: query,
            analysis: NexusAnalysis,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Nexus API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
