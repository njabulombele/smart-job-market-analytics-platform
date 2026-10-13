'use client';

import { useState } from 'react';
import { aiApi } from '@/lib/api';
import { Upload, CheckCircle, XCircle, FileText, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchResult {
  score: number; matchedSkills: string[];
  missingSkills: string[]; explanation: string;
}

export default function ResumeMatchPage() {
  const [file,      setFile]      = useState<File | null>(null);
  const [jobId,     setJobId]     = useState('');
  const [result,    setResult]    = useState<MatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState('');
  const [dragging,  setDragging]  = useState(false);

  const handleSubmit = async () => {
    if (!file || !jobId) return;
    const fd = new FormData();
    fd.append('resume', file); fd.append('jobId', jobId);
    setIsLoading(true); setError('');
    try {
      const { data } = await aiApi.matchResume(fd);
      setResult(data);
    } catch { setError('Match failed. Please try again.'); }
    finally { setIsLoading(false); }
  };

  const scoreTheme = (s: number) => {
    if (s >= 0.8) return { ring: 'ring-emerald-400', text: 'text-emerald-600', bg: 'from-emerald-50 to-teal-50', bar: 'from-emerald-500 to-teal-400',   label: 'Excellent Match', border: 'border-emerald-200' };
    if (s >= 0.5) return { ring: 'ring-amber-400',   text: 'text-amber-600',   bg: 'from-amber-50 to-orange-50', bar: 'from-amber-400 to-orange-400',   label: 'Good Match',      border: 'border-amber-200'   };
    return               { ring: 'ring-rose-400',    text: 'text-rose-600',    bg: 'from-rose-50 to-pink-50',    bar: 'from-rose-400 to-pink-400',      label: 'Low Match',       border: 'border-rose-200'    };
  };

  return (
    <div className="max-w-2xl space-y-5">

      {/* ── Hero ── */}
      <div className="hero-amber rounded-2xl px-6 py-5 border border-amber-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500
                          flex items-center justify-center shadow-md shadow-amber-500/30">
            <FileText size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight
                           bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              Resume Matcher
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Upload your CV and match it against any job posting</p>
          </div>
        </div>
      </div>

      {/* ── Upload card ── */}
      <div className="card card-accent-amber space-y-5">
        <div className="section-banner hero-amber rounded-t-2xl -mx-6 -mt-6 mb-5 px-6 py-3">
          <p className="text-sm font-bold text-amber-700">Upload Your Resume</p>
        </div>

        {/* Drop zone */}
        <label
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
          className={cn(
            'flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all duration-150',
            dragging ? 'border-indigo-400 bg-indigo-50 scale-[1.01]'
              : file ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50'
              : 'border-amber-200 bg-amber-50/50 hover:border-amber-400 hover:bg-amber-50'
          )}>
          {file ? (
            <>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500
                              flex items-center justify-center mb-2 shadow-md shadow-emerald-500/30">
                <FileText size={22} className="text-white" />
              </div>
              <p className="text-sm font-bold text-emerald-700">{file.name}</p>
              <p className="text-xs text-emerald-500 mt-0.5 font-medium">{(file.size / 1024).toFixed(0)} KB — ready</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400
                              flex items-center justify-center mb-2 shadow-md shadow-amber-400/30">
                <Upload size={22} className="text-white" />
              </div>
              <p className="text-sm font-bold text-slate-600">Drop your resume here</p>
              <p className="text-xs text-slate-400 mt-0.5">PDF, DOC or DOCX · click to browse</p>
            </>
          )}
          <input type="file" accept=".pdf,.doc,.docx" className="hidden"
            onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </label>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Job ID</label>
          <input type="number" value={jobId} onChange={e => setJobId(e.target.value)}
            placeholder="Paste the Job ID from the Jobs page"
            className="input" />
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            <p className="text-rose-600 text-sm font-medium">{error}</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={!file || !jobId || isLoading}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
          {isLoading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Analysing…</>
          ) : (
            <><Zap size={16} />Match Resume</>
          )}
        </button>
      </div>

      {/* ── Results ── */}
      {result && (() => {
        const c = scoreTheme(result.score);
        const pct = Math.round(result.score * 100);
        return (
          <div className="card card-accent-emerald space-y-6">
            <div className={`section-banner bg-gradient-to-br ${c.bg} border-b ${c.border} rounded-t-2xl -mx-6 -mt-6 mb-5 px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Match Results</h2>
                  <p className={`text-sm font-bold mt-0.5 ${c.text}`}>{c.label}</p>
                </div>
                <div className={cn('w-20 h-20 rounded-full ring-4 bg-white flex flex-col items-center justify-center shadow-lg', c.ring)}>
                  <span className={cn('text-2xl font-extrabold', c.text)}>{pct}%</span>
                </div>
              </div>
            </div>

            {/* Bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-2 font-semibold">
                <span>Match score</span><span>{pct}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div className={`h-full bg-gradient-to-r ${c.bar} rounded-full transition-all duration-700 shadow-sm`}
                     style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-gradient-to-br from-slate-50 to-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
              {result.explanation}
            </div>

            {/* Skills */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="flex items-center gap-1.5 text-sm font-extrabold text-emerald-700 mb-3">
                  <CheckCircle size={15} /> Matched ({result.matchedSkills.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedSkills.map(s => (
                    <span key={s} className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-1 font-bold">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="flex items-center gap-1.5 text-sm font-extrabold text-rose-700 mb-3">
                  <XCircle size={15} /> Missing ({result.missingSkills.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills.map(s => (
                    <span key={s} className="text-xs bg-rose-100 text-rose-700 border border-rose-200 rounded-full px-2.5 py-1 font-bold">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
