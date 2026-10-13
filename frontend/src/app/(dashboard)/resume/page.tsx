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
    fd.append('resume', file);
    fd.append('jobId', jobId);
    setIsLoading(true); setError('');
    try {
      const { data } = await aiApi.matchResume(fd);
      setResult(data);
    } catch { setError('Match failed. Please try again.'); }
    finally { setIsLoading(false); }
  };

  const scoreColor = (s: number) => {
    if (s >= 0.8) return { ring: 'ring-emerald-400', text: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500', label: 'Excellent' };
    if (s >= 0.5) return { ring: 'ring-amber-400',   text: 'text-amber-600',   bg: 'bg-amber-50',   bar: 'bg-amber-500',   label: 'Good' };
    return          { ring: 'ring-red-400',    text: 'text-red-600',    bg: 'bg-red-50',    bar: 'bg-red-500',    label: 'Low' };
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="page-header">
        <h1>Resume Matcher</h1>
        <p>Upload your CV and match it against any job posting</p>
      </div>

      <div className="card space-y-5">
        {/* Drop zone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Resume (PDF / DOC)</label>
          <label
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
            className={cn(
              'flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition duration-150',
              dragging
                ? 'border-blue-400 bg-blue-50'
                : file
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50'
            )}>
            {file ? (
              <>
                <FileText size={28} className="text-emerald-500 mb-2" />
                <p className="text-sm font-medium text-emerald-700">{file.name}</p>
                <p className="text-xs text-emerald-500 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
              </>
            ) : (
              <>
                <Upload size={26} className="text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-600">Drop your resume here</p>
                <p className="text-xs text-slate-400 mt-0.5">or click to browse</p>
              </>
            )}
            <input type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={e => setFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>

        {/* Job ID */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Job ID to Match Against</label>
          <input type="number" value={jobId} onChange={e => setJobId(e.target.value)}
            placeholder="Enter the Job ID from the Jobs page"
            className="input" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={!file || !jobId || isLoading}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analysing…
            </>
          ) : (
            <>
              <Zap size={15} />
              Match Resume
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (() => {
        const c = scoreColor(result.score);
        const pct = Math.round(result.score * 100);
        return (
          <div className="card space-y-6">
            {/* Score */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Match Results</h2>
                <p className="text-sm text-slate-500 mt-0.5">{c.label} match</p>
              </div>
              <div className={cn('w-20 h-20 rounded-full ring-4 flex flex-col items-center justify-center', c.ring, c.bg)}>
                <span className={cn('text-2xl font-bold', c.text)}>{pct}%</span>
              </div>
            </div>

            {/* Score bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>Match score</span><span>{pct}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full transition-all duration-700', c.bar)}
                     style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
              {result.explanation}
            </div>

            {/* Skills split */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 mb-3">
                  <CheckCircle size={14} /> Matched ({result.matchedSkills.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedSkills.map(s => (
                    <span key={s} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-1 font-medium">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-rose-700 mb-3">
                  <XCircle size={14} /> Missing ({result.missingSkills.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills.map(s => (
                    <span key={s} className="text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-full px-2.5 py-1 font-medium">{s}</span>
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
