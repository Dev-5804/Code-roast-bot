import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.LLM_API_KEY || 'dummy_key_for_build' });
const modelName = process.env.LLM_MODEL || 'gemini-2.5-flash';

// Define the schema as required by the Gemini API for structured output
const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A summary of the analysis.",
        },
        issues: {
            type: Type.ARRAY,
            description: "A list of issues found in the code.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: {
                        type: Type.STRING,
                        enum: ["security", "performance", "logic", "style"],
                    },
                    severity: {
                        type: Type.STRING,
                        enum: ["low", "medium", "high"],
                    },
                    line: {
                        type: Type.INTEGER,
                        nullable: true,
                    },
                    description: {
                        type: Type.STRING,
                        description: "A description of the issue.",
                    },
                    fix: {
                        type: Type.STRING,
                        description: "A concrete code snippet showing the corrected, better version of the code that resolves the issue. Do not include markdown formatting or explanations here, just the code itself.",
                    }
                },
                required: ["type", "severity", "description", "fix"]
            }
        },
        complexity: {
            type: Type.OBJECT,
            properties: {
                time: {
                    type: Type.STRING,
                    nullable: true,
                },
                space: {
                    type: Type.STRING,
                    nullable: true,
                }
            }
        },
        refactoredCode: {
            type: Type.STRING,
            description: "The fully rewritten source code. Plain code only — no markdown code fences, no backticks, no language tags.",
            nullable: true,
        }
    },
    required: ["summary", "issues", "complexity"]
};

export async function analyzeCode(code: string, language: string, mode: 'strict' | 'optimize' | 'refactor') {
    let modePrompt = '';
    switch (mode) {
        case 'strict':
            modePrompt = 'Focus on strict code review. Look for logical errors, security vulnerabilities, edge case failures, anti-patterns, and poor practices. Set complexity fields to null. Set refactoredCode to null.';
            break;
        case 'optimize':
            modePrompt = 'Focus on optimization analysis. Calculate time and space complexity, identify bottlenecks, and suggest concrete optimization improvements. Put the complexity values in the complexity object. Set refactoredCode to null.';
            break;
        case 'refactor':
            modePrompt = 'Focus on refactoring the code for better structure, naming, and separation of concerns. Provide the full rewritten version of the code in the `refactoredCode` field as plain source code only — no markdown, no backticks, no code fences. Set complexity fields to null.';
            break;
    }

    const prompt = `
    Analyze the following ${language} code.
    
    Mode Instructions:
    ${modePrompt}

    Code to analyze:
    \`\`\`${language}
    ${code}
    \`\`\`

    Respond STRICTLY in JSON according to the schema.
    - If mode is not 'refactor', \`refactoredCode\` MUST be null.
    - If mode is not 'optimize', \`complexity.time\` structure and \`complexity.space\` MUST be null.
    - If no issues exist, return an empty array for \`issues\`.
    - No additional keys are allowed.
  `;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: [prompt],
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        if (response.text) {
            return { success: true, data: JSON.parse(response.text) };
        }
        return { success: false, error: 'No output received from the model.' };

    } catch (error: unknown) {
        console.error('LLM Error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to analyze code.' };
    }
}
