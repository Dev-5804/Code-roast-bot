import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/validation';
import { analyzeCode } from '@/lib/llm';
import { llmResponseSchema } from '@/lib/schema';
import { checkRateLimit, checkGlobalLimit } from '@/lib/rateLimit';

export async function POST(req: Request) {
    try {
        // 1. Extract client IP and check rate limit
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? req.headers.get('x-real-ip') ?? '127.0.0.1';
        if (!checkRateLimit(ip).allowed) {
            return NextResponse.json(
                { success: false, error: 'Rate limit exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await req.json();

        // 2 & 3. Validate request body and line count
        const validationResult = validateRequest(body);
        if (!validationResult.success || !validationResult.data) {
            return NextResponse.json(
                { success: false, error: validationResult.error },
                { status: 400 }
            );
        }

        const { language, mode, code } = validationResult.data;

        // Check global LLM call budget before hitting the API
        if (!checkGlobalLimit().allowed) {
            return NextResponse.json(
                { success: false, error: 'Service is temporarily unavailable. Please try again later.' },
                { status: 503 }
            );
        }

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

        // 7. Clean refactoredCode and return
        const data = schemaValidation.data;
        if (data.refactoredCode) {
            // Strip any markdown code fences the model may have included
            let code = data.refactoredCode;
            console.log('[Analyze] raw refactoredCode (first 120):', JSON.stringify(code.slice(0, 120)));
            // Fix double-escaped newlines (Gemini sometimes returns \n instead of real newlines)
            code = code.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
            // Strip leading ```lang or ``` fence
            code = code.replace(/^```[\w\s]*\r?\n?/, '');
            // Strip trailing ``` fence
            code = code.replace(/\r?\n?```[\s]*$/, '');
            data.refactoredCode = code.trim();
        }

        // 8. Enforce mode-dependent output rules
        if (mode !== 'refactor') data.refactoredCode = null;
        if (mode !== 'optimize') {
            data.complexity.time = null;
            data.complexity.space = null;
        }

        return NextResponse.json({ success: true, data });

    } catch (error: unknown) {
        console.error('API Route Error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred processing your request.' },
            { status: 500 }
        );
    }
}
