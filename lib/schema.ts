import { z } from 'zod';

export const analyzeRequestSchema = z.object({
    language: z.string().min(1),
    mode: z.enum(['strict', 'optimize', 'refactor']),
    code: z.string().min(1).max(20000), // Approximate 500 lines limit, we'll also check line count
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export const llmResponseSchema = z.object({
    summary: z.string(),
    issues: z.array(
        z.object({
            type: z.enum(['security', 'performance', 'logic', 'style']),
            severity: z.enum(['low', 'medium', 'high']),
            line: z.union([z.number(), z.null()]),
            description: z.string(),
            fix: z.string(),
        })
    ),
    complexity: z.object({
        time: z.union([z.string(), z.null()]),
        space: z.union([z.string(), z.null()]),
    }),
    refactoredCode: z.union([z.string(), z.null()]),
});

export type LlmResponse = z.infer<typeof llmResponseSchema>;
