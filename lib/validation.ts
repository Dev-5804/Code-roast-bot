import { analyzeRequestSchema } from './schema';

export function validateLineCount(code: string, maxLines: number = 500): boolean {
    const lineCount = code.split('\n').length;
    return lineCount <= maxLines;
}

export function validateRequest(body: unknown) {
    const result = analyzeRequestSchema.safeParse(body);
    if (!result.success) {
        return {
            success: false,
            error: 'Invalid request format or missing required fields.',
            details: result.error.issues,
        };
    }

    if (!validateLineCount(result.data.code)) {
        return {
            success: false,
            error: 'Input code exceeds the maximum allowed length of 500 lines.',
        };
    }

    return { success: true, data: result.data };
}
