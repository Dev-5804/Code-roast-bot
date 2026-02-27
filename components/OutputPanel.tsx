import { AnalysisResponse } from '@/types/analysis';
import { AlertCircle, CheckCircle, Clock, Database, Terminal } from 'lucide-react';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface OutputPanelProps {
    data: AnalysisResponse | null;
    loading: boolean;
    error: string | null;
    mode: 'strict' | 'optimize' | 'refactor';
}

export default function OutputPanel({ data, loading, error, mode }: OutputPanelProps) {
    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-8 border border-gray-200 bg-gray-50 rounded-md">
                <div className="text-gray-500 animate-pulse flex flex-col items-center">
                    <Terminal className="w-8 h-8 mb-4 opacity-50" />
                    <span>Analyzing code structure...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 border border-red-200 bg-red-50 rounded-md text-red-700">
                <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <h3 className="font-semibold">Analysis Failed</h3>
                </div>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 border border-gray-200 bg-gray-50 rounded-md text-gray-400">
                <Terminal className="w-8 h-8 mb-4 opacity-20" />
                <p>Awaiting code input</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full h-full overflow-y-auto pr-2 pb-8">

            {/* Summary Section */}
            <section className="card p-5">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Summary</h2>
                <p className="text-gray-900 leading-relaxed text-sm">{data.summary}</p>
            </section>

            {/* Issues Section */}
            <section className="card">
                <div className="p-5 border-b border-gray-200">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Detected Issues</h2>
                </div>

                {data.issues.length === 0 ? (
                    <div className="p-6 flex flex-col items-center justify-center text-gray-500 gap-2">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <span className="text-sm">No significant issues detected.</span>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {data.issues.map((issue, idx) => (
                            <div key={idx} className="p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm uppercase ${issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                                            issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {issue.severity}
                                        </span>
                                        <span className="text-xs text-gray-500 capitalize">{issue.type} Issue</span>
                                    </div>
                                    {issue.line !== null && (
                                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                                            Line {issue.line}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-800 text-sm font-medium mb-1.5">{issue.description}</p>
                                <div className="mt-2 text-sm">
                                    <span className="font-semibold text-gray-700">Suggested Fix:</span>
                                    <div className="bg-gray-50 p-3 rounded border border-gray-200 mt-1">
                                        <pre className="text-gray-800 font-mono text-xs whitespace-pre-wrap break-words">
                                            <code>{issue.fix}</code>
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Complexity Section */}
            {mode === 'optimize' && data.complexity && (
                <section className="card p-5">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Complexity Analysis</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-xs text-gray-500 font-medium">Time Complexity</div>
                                <div className="font-mono mt-0.5">{data.complexity.time || 'O(1)'}</div>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 flex items-center gap-3">
                            <Database className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-xs text-gray-500 font-medium">Space Complexity</div>
                                <div className="font-mono mt-0.5">{data.complexity.space || 'O(1)'}</div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Refactored Code Section */}
            {mode === 'refactor' && data.refactoredCode && (
                <section className="card overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Refactored Code</h2>
                    </div>
                    <div className="h-[400px] border-t border-gray-200">
                        <Editor
                            height="100%"
                            language="javascript" /* Can make this dynamic later, but works well for syntax */
                            theme="light"
                            value={data.refactoredCode || ''}
                            options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                fontSize: 13,
                                lineHeight: 22,
                                padding: { top: 16, bottom: 16 },
                                scrollBeyondLastLine: false,
                                fontFamily: "var(--font-mono), monospace",
                            }}
                        />
                    </div>
                </section>
            )}

        </div>
    );
}
