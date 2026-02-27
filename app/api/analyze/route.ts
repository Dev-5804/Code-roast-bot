import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/validation';
import { analyzeCode } from '@/lib/llm';
import { llmResponseSchema } from '@/lib/schema';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1 & 2. Validate request body and line count
        const validationResult = validateRequest(body);
        if (!validationResult.success || !validationResult.data) {
            return NextResponse.json(
                { success: false, error: validationResult.error },
                { status: 400 }
            );
        }

        const { language, mode, code } = validationResult.data;

        // 3, 4, & 5. Construct prompt, send to LLM, parse JSON
        const startTime = Date.now();
        const llmResult = await analyzeCode(code, language, mode as 'strict' | 'optimize' | 'refactor');

        // 12. Logging
        console.log(`[Analyze] mode=${mode} lang=${language} time=${Date.now() - startTime}ms success=${llmResult.success}`);

        if (!llmResult.success) {
            return NextResponse.json(
                { success: false, error: llmResult.error || 'LLM analysis failed.' },
                { status: 500 }
            );
        }

        // 6. Validate result against strict schema
        const schemaValidation = llmResponseSchema.safeParse(llmResult.data);

        if (!schemaValidation.success) {
            console.error('Schema validation failed:', schemaValidation.error);
            return NextResponse.json(
                { success: false, error: 'The LLM response did not match the required schema.' },
                { status: 500 }
            );
        }

        // 7. Return structured response
        return NextResponse.json({ success: true, data: schemaValidation.data });

    } catch (error: unknown) {
        console.error('API Route Error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred processing your request.' },
            { status: 500 }
        );
    }
}
