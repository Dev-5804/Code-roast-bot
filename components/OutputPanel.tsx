"use client";

import { useState } from 'react';
import { AnalysisResponse } from '@/types/analysis';
import {
  Bug, Check, CheckCircle, Clock,
  Code2, Copy, Database, Info,
  RefreshCw, Search, ShieldAlert,
  Terminal, Zap,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface OutputPanelProps {
  data:     AnalysisResponse | null;
  loading:  boolean;
  mode:     'strict' | 'optimize' | 'refactor';
  language: string;
}

const SEV = {
  high: {
    badge:  'bg-[#f85149]/10 text-[#f85149] border border-[#f85149]/30',
    border: 'border-[#f85149]/20 hover:border-[#f85149]/40',
    icon:   ShieldAlert,
    cls:    'text-[#f85149]',
  },
  medium: {
    badge:  'bg-[#d29922]/10 text-[#d29922] border border-[#d29922]/30',
    border: 'border-[#d29922]/20 hover:border-[#d29922]/40',
    icon:   Zap,
    cls:    'text-[#d29922]',
  },
  low: {
    badge:  'bg-[#c9ada7]/10 text-[#c9ada7] border border-[#c9ada7]/30',
    border: 'border-[#4a4e69] hover:border-[#c9ada7]/30',
    icon:   Info,
    cls:    'text-[#9a8c98]',
  },
} as const;

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }}
      title="Copy fix"
      className={`p-1.5 rounded transition-all ${
        done ? 'text-[#3fb950]' : 'text-[#9a8c98] hover:text-[#f2e9e4] hover:bg-[#4a4e69]'
      }`}
    >
      {done ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function Skeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-3.5 bg-[#22223b] rounded animate-pulse w-32" />
      <div className="rounded-lg border border-[#4a4e69] bg-[#1b1b2f] p-5 space-y-3">
        <div className="h-3 bg-[#22223b] rounded animate-pulse" />
        <div className="h-3 bg-[#22223b] rounded animate-pulse w-4/5" />
        <div className="h-3 bg-[#22223b] rounded animate-pulse w-3/5" />
      </div>
      <div className="h-3.5 bg-[#22223b] rounded animate-pulse w-28 mt-4" />
      {[0, 1, 2].map(i => (
        <div key={i} className="rounded-lg border border-[#4a4e69] bg-[#1b1b2f] overflow-hidden">
          <div className="p-4 flex justify-between items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-[#22223b] rounded animate-pulse w-3/4" />
              <div className="h-3 bg-[#22223b] rounded animate-pulse w-1/2" />
            </div>
            <div className="h-5 w-14 bg-[#22223b] rounded-full animate-pulse shrink-0" />
          </div>
          <div className="px-4 pb-4">
            <div className="h-14 bg-[#141423] rounded border border-[#4a4e69] animate-pulse" />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-2">
        {[0, 150, 300].map(d => (
          <span
            key={d}
            className="w-2 h-2 rounded-full bg-[#c9ada7] animate-bounce"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
        <span className="text-xs text-[#9a8c98] ml-1">Analyzing your code...</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative overflow-hidden select-none">
      {/* Dot grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #4a4e69 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.4,
        }}
      />
      {/* Faint decorative code bars — top-left */}
      <div className="absolute top-10 left-8 space-y-2 pointer-events-none opacity-[0.07]">
        {[48, 64, 40, 56, 32].map((w, i) => (
          <div
            key={i}
            className="h-2 rounded bg-[#f2e9e4]"
            style={{ width: w, marginLeft: [0, 16, 16, 32, 32][i] }}
          />
        ))}
      </div>
      {/* Faint decorative code bars — bottom-right */}
      <div className="absolute bottom-10 right-8 space-y-2 pointer-events-none opacity-[0.05] flex flex-col items-end">
        {[52, 68, 44].map((w, i) => (
          <div key={i} className="h-2 rounded bg-[#f2e9e4]" style={{ width: w }} />
        ))}
      </div>

      {/* Centre content */}
      <div className="relative z-10 text-center">
        <div className="w-14 h-14 rounded-xl bg-[#1b1b2f] border border-[#4a4e69] flex items-center justify-center mx-auto mb-5">
          <Terminal className="w-6 h-6 text-[#4a4e69]" />
        </div>
        <h3 className="text-sm font-semibold text-[#f2e9e4] mb-1">Ready to analyze</h3>
        <p className="text-xs text-[#9a8c98] max-w-52 leading-relaxed mx-auto">
          Paste your code in the editor and hit Analyze Code
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {[
            { Icon: Search,    label: 'Bugs & Security' },
            { Icon: Zap,       label: 'Complexity'      },
            { Icon: RefreshCw, label: 'Refactoring'     },
          ].map(({ Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 text-[10px] font-medium text-[#9a8c98]
                         bg-[#1b1b2f] border border-[#4a4e69] px-2.5 py-1 rounded-full"
            >
              <Icon className="w-2.5 h-2.5" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OutputPanel({ data, loading, mode, language }: OutputPanelProps) {
  if (loading) return <Skeleton />;
  if (!data)   return <EmptyState />;

  const highCount = data.issues.filter(i => i.severity === 'high').length;
  const medCount  = data.issues.filter(i => i.severity === 'medium').length;
  const lowCount  = data.issues.filter(i => i.severity === 'low').length;

  // Map short ext back to Monaco language id
  const monacoLang = language === 'py' ? 'python'
    : language === 'jv'   ? 'java'
    : language === 'js'   ? 'javascript'
    : language === 'ts'   ? 'typescript'
    : language; // cpp stays as cpp

  return (
    <div className="p-6 space-y-5 max-w-3xl mx-auto w-full pb-16">

      {/* Summary */}
      <section className="rounded-lg border border-[#4a4e69] bg-[#1b1b2f] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#4a4e69] bg-[#141423]/50">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
          <span className="text-[10px] font-semibold text-[#9a8c98] uppercase tracking-widest">Summary</span>
        </div>
        <div className="p-5">
          <p className="text-sm text-[#f2e9e4] leading-relaxed">{data.summary}</p>
        </div>
        {/* Severity breakdown */}
        {data.issues.length > 0 && (
          <div className="flex items-center gap-4 px-5 pb-4 border-t border-[#4a4e69] pt-3">
            {highCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#f85149]">
                <span className="w-2 h-2 rounded-full bg-[#f85149]" />{highCount} high
              </span>
            )}
            {medCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#d29922]">
                <span className="w-2 h-2 rounded-full bg-[#d29922]" />{medCount} medium
              </span>
            )}
            {lowCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#9a8c98]">
                <span className="w-2 h-2 rounded-full bg-[#9a8c98]" />{lowCount} low
              </span>
            )}
            <span className="ml-auto text-[10px] text-[#9a8c98]">{data.issues.length} total</span>
          </div>
        )}
      </section>

      {/* Issues */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Bug className="w-3.5 h-3.5 text-[#9a8c98]" />
          <span className="text-[10px] font-semibold text-[#9a8c98] uppercase tracking-widest">
            Identified Issues
          </span>
        </div>

        {data.issues.length === 0 ? (
          <div className="rounded-lg border border-[#4a4e69] bg-[#1b1b2f] p-10 flex flex-col items-center gap-3">
            <CheckCircle className="w-6 h-6 text-[#3fb950]" />
            <span className="text-sm text-[#9a8c98]">No issues detected</span>
          </div>
        ) : (
          <div className="space-y-2">
            {data.issues.map((issue, idx) => {
              const cfg = SEV[issue.severity];
              const Icon = cfg.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-lg border bg-[#1b1b2f] overflow-hidden transition-colors ${cfg.border}`}
                >
                  <div className="p-4 flex gap-3">
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.cls}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-sm text-[#f2e9e4] font-medium leading-snug">{issue.description}</p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {issue.line !== null && (
                            <span className="text-[10px] font-mono text-[#9a8c98] bg-[#141423] px-2 py-0.5 rounded border border-[#4a4e69]">
                              L{issue.line}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.badge}`}>
                            {issue.severity}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#9a8c98] uppercase tracking-widest">{issue.type}</span>
                    </div>
                  </div>
                  {/* Fix block */}
                  {issue.fix && (
                    <div className="border-t border-[#4a4e69] bg-[#141423]">
                      <div className="flex items-center justify-between px-4 py-1.5 border-b border-[#4a4e69]/50">
                        <span className="text-[10px] font-semibold text-[#9a8c98] uppercase tracking-widest">Suggested Fix</span>
                        <CopyButton text={issue.fix} />
                      </div>
                      <div className="p-4 overflow-x-auto">
                        {issue.fix.split('\n').map((line, i) => (
                          <div key={i} className="flex gap-3">
                            <span className="text-[#3fb950] select-none text-xs leading-5 w-3 shrink-0">+</span>
                            <code className="text-[#3fb950] text-xs leading-5 font-mono whitespace-pre">{line}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Complexity */}
      {mode === 'optimize' && data.complexity && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5 text-[#9a8c98]" />
            <span className="text-[10px] font-semibold text-[#9a8c98] uppercase tracking-widest">Complexity</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[#4a4e69] bg-[#1b1b2f] p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#9a8c98] shrink-0" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9a8c98] mb-1">Time</div>
                <div className="font-mono text-[#f2e9e4] text-sm">{data.complexity.time || 'O(1)'}</div>
              </div>
            </div>
            <div className="rounded-lg border border-[#4a4e69] bg-[#1b1b2f] p-4 flex items-center gap-3">
              <Database className="w-5 h-5 text-[#9a8c98] shrink-0" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9a8c98] mb-1">Space</div>
                <div className="font-mono text-[#f2e9e4] text-sm">{data.complexity.space || 'O(1)'}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Refactored code */}
      {mode === 'refactor' && data.refactoredCode && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Code2 className="w-3.5 h-3.5 text-[#9a8c98]" />
            <span className="text-[10px] font-semibold text-[#9a8c98] uppercase tracking-widest">Refactored Code</span>
          </div>
          <div className="rounded-lg border border-[#4a4e69] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1b1b2f] border-b border-[#4a4e69]">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f85149]/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#d29922]/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950]/50" />
              </div>
              <span className="text-[11px] font-mono text-[#9a8c98] ml-1">refactored.{language}</span>
            </div>
            <div className="h-96">
              <Editor
                height="100%"
                language={monacoLang}
                theme="vs-dark"
                value={(() => {
                  let code = data.refactoredCode || '';
                  code = code.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
                  code = code.replace(/^```[\w\s]*\r?\n?/, '').replace(/\r?\n?```\s*$/, '');
                  return code.trim();
                })()}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineHeight: 22,
                  padding: { top: 12, bottom: 12 },
                  scrollBeyondLastLine: false,
                  fontFamily: "'Serifa', var(--font-geist-mono), monospace",
                }}
              />
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
