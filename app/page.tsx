"use client";

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import OutputPanel from '@/components/OutputPanel';
import { AnalysisResponse } from '@/types/analysis';
import { registerCompletionProviders } from '@/lib/completions';
import { Check, Copy, FileCode2, RefreshCw, Search, Trash2, Zap } from 'lucide-react';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const LANGUAGES = [
  { id: 'javascript', name: 'JS',  full: 'JavaScript', ext: 'js'   },
  { id: 'typescript', name: 'TS',  full: 'TypeScript', ext: 'ts'   },
  { id: 'python',     name: 'PY',  full: 'Python',     ext: 'py'   },
  { id: 'java',       name: 'JV',  full: 'Java',       ext: 'java' },
  { id: 'cpp',        name: 'C++', full: 'C++',        ext: 'cpp'  },
];

const MODES = [
  { id: 'strict',   label: 'Strict Review', Icon: Search,    desc: 'Bugs, security & anti-patterns' },
  { id: 'optimize', label: 'Optimize',      Icon: Zap,       desc: 'Time & space complexity' },
  { id: 'refactor', label: 'Refactor',      Icon: RefreshCw, desc: 'Rewrite for cleaner structure' },
] as const;

export default function Home() {
  const [code, setCode]         = useState('');
  const [language, setLanguage] = useState('javascript');
  const [mode, setMode]         = useState<'strict' | 'optimize' | 'refactor'>('strict');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [result, setResult]     = useState<AnalysisResponse | null>(null);
  const [copied, setCopied]     = useState(false);

  const lineCount = useMemo(() => (code ? code.split('\n').length : 0), [code]);
  const charCount = useMemo(() => code.length, [code]);

  const selectedLang = LANGUAGES.find(l => l.id === language)!;
  const selectedMode = MODES.find(m => m.id === mode)!;

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setCode('');
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError('Please paste some code to analyze.');
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
      if (!response.ok || !json.success) throw new Error(json.error || 'Failed to analyze code.');
      setResult(json.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#141423] flex flex-col overflow-hidden">
      <Header />

      <main className="flex flex-1 overflow-hidden">

        {/* ── Left: Editor panel ── */}
        <section className="flex flex-col w-1/2 border-r border-[#4a4e69] min-w-80">

          {/* Language pills */}
          <div className="px-4 pt-4 pb-3 border-b border-[#4a4e69] bg-[#1b1b2f] shrink-0">
            <div className="label mb-2">Language</div>
            <div className="flex gap-1.5">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  title={lang.full}
                  className={`lang-pill ${language === lang.id ? 'lang-pill-on' : 'lang-pill-off'}`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mode tabs */}
          <div className="px-4 py-3 border-b border-[#4a4e69] bg-[#141423]/70 shrink-0">
            <div className="label mb-2">Analysis Mode</div>
            <div className="grid grid-cols-3 gap-1.5">
              {MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  title={m.desc}
                  className={`mode-tab ${mode === m.id ? 'mode-tab-on' : 'mode-tab-off'}`}
                >
                  <m.Icon className="w-3 h-3 shrink-0" />
                  {m.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#9a8c98] mt-2 leading-relaxed">{selectedMode.desc}</p>
          </div>

          {/* Editor chrome bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#1b1b2f] border-b border-[#4a4e69] shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#f85149]/60" />
                <span className="w-3 h-3 rounded-full bg-[#d29922]/60" />
                <span className="w-3 h-3 rounded-full bg-[#3fb950]/60" />
              </div>
              <span className="text-[11px] font-mono text-[#9a8c98] ml-1">
                main.{selectedLang.ext}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {lineCount > 0 && (
                <span className="text-[10px] text-[#9a8c98] font-mono tabular-nums mr-2">
                  {lineCount} ln · {charCount} ch
                </span>
              )}
              <button
                onClick={handleCopy}
                title={copied ? 'Copied!' : 'Copy code'}
                className={`p-1.5 rounded transition-all ${
                  copied ? 'text-[#3fb950]' : 'text-[#9a8c98] hover:text-[#f2e9e4] hover:bg-[#22223b]'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleClear}
                title="Clear editor"
                className="p-1.5 rounded text-[#9a8c98] hover:text-[#f85149] hover:bg-[#f85149]/5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative overflow-hidden">
            {!code && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 gap-2">
                <FileCode2 className="w-9 h-9 text-[#4a4e69]" />
                <p className="text-xs font-mono text-[#9a8c98]">{'// paste your code here'}</p>
                <p className="text-[10px] text-[#4a4e69]">up to 500 lines supported</p>
              </div>
            )}
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              beforeMount={registerCompletionProviders}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 24,
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                fontFamily: "'Serifa', var(--font-geist-mono), monospace",
                fontLigatures: true,
              }}
            />
          </div>

          {/* Analyze button */}
          <div className="p-4 border-t border-[#4a4e69] bg-[#1b1b2f] shrink-0">
            {error && (
              <p className="text-xs text-[#f85149] flex items-center gap-1.5 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f85149] shrink-0" />
                {error}
              </p>
            )}
            <button onClick={handleAnalyze} disabled={loading} className="btn-primary">
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 shrink-0" />
                  Analyze Code
                </>
              )}
            </button>
          </div>

        </section>

        {/* ── Right: Output panel ── */}
        <section className="flex-1 overflow-y-auto bg-[#141423]">
          <OutputPanel data={result} loading={loading} mode={mode} language={selectedLang.ext} />
        </section>

      </main>
    </div>
  );
}
