"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import OutputPanel from '@/components/OutputPanel';
import { AnalysisResponse } from '@/types/analysis';

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
];

const MODES = [
  { id: 'strict', name: 'Strict Review' },
  { id: 'optimize', name: 'Optimization Analysis' },
  { id: 'refactor', name: 'Refactor Mode' },
];

const DEFAULT_CODE = "";

export default function Home() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState('javascript');
  const [mode, setMode] = useState<'strict' | 'optimize' | 'refactor'>('strict');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError("Please provide some code to analyze.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, mode }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to analyze code.');
      }

      setResult(json.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-[1100px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6 lg:gap-8 h-[calc(100vh-56px)]">

        {/* Left Panel: Editor & Controls */}
        <div className="flex flex-col w-full md:w-1/2 h-full gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="language-select" className="label">Language</label>
              <select
                id="language-select"
                className="select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="mode-select" className="label">Mode</label>
              <select
                id="mode-select"
                className="select"
                value={mode}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMode(e.target.value as 'strict' | 'optimize' | 'refactor')}
              >
                {MODES.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[400px] border border-gray-300 shadow-sm rounded-md overflow-hidden bg-white">
            <Editor
              height="400px"
              language={language}
              theme="light"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 24,
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                fontFamily: "var(--font-mono), monospace",
              }}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="btn-primary w-full py-3 h-12 flex justify-center items-center font-semibold text-[15px]"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Analyze Code'
            )}
          </button>
        </div>

        {/* Right Panel: Output */}
        <div className="w-full md:w-1/2 h-full">
          <OutputPanel data={result} loading={loading} error={error} mode={mode} />
        </div>

      </main>
    </div>
  );
}
