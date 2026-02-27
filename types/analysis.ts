export interface Issue {
    type: 'security' | 'performance' | 'logic' | 'style';
    severity: 'low' | 'medium' | 'high';
    line: number | null;
    description: string;
    fix: string;
}

export interface Complexity {
    time: string | null;
    space: string | null;
}

export interface AnalysisResponse {
    summary: string;
    issues: Issue[];
    complexity: Complexity;
    refactoredCode: string | null;
}
