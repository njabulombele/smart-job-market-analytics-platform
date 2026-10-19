'use client';

import { useState } from 'react';
import { aiApi } from '@/lib/api';
import { Upload, CheckCircle, XCircle, FileText, Zap } from 'lucide-react';

interface Result { score:number; matchedSkills:string[]; missingSkills:string[]; explanation:string; }

export default function ResumePage() {
  const [file,      setFile]      = useState<File|null>(null);
  const [jobId,     setJobId]     = useState('');
  const [result,    setResult]    = useState<Result|null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [dragging,  setDragging]  = useState(false);

  const run = async () => {
    if (!file || !jobId) return;
    const fd = new FormData(); fd.append('resume', file); fd.append('jobId', jobId);
    setLoading(true); setError('');
    try { const { data } = await aiApi.matchResume(fd); setResult(data); }
    catch { setError('Analysis failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const theme = (s: number) => {
    if (s >= .8) return { color:'#15803D', label:'Excellent match',  bg:'#F0FDF4', border:'#BBF7D0' };
    if (s >= .5) return { color:'#B45309', label:'Good match',       bg:'#FFFBEB', border:'#FDE68A' };
    return             { color:'#B91C1C', label:'Low match',         bg:'#FEF2F2', border:'#FECACA' };
  };

  return (
    <div className="max-w-2xl space-y-4">

      <div className="page-hero">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
               style={{ background: '#B45309' }}>
            <FileText size={18} className="text-white" />
          </div>
          <div>
            <h1 className="page-hero-title">Resume Matcher</h1>
            <p className="page-hero-sub">Upload your CV and match it against any job posting</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <h2 className="section-title">Upload Resume</h2>
        </div>
        <div style={{ padding:'20px' }}>

          {/* Drop zone */}
          <label
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f=e.dataTransfer.files[0]; if(f) setFile(f); }}
            style={{
              display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', border:`2px dashed ${dragging?'#2557A7':file?'#15803D':'#D1D5DB'}`,
              borderRadius:8, padding:'32px', cursor:'pointer',
              background: dragging?'#EBF2FF':file?'#F0FDF4':'#F9FAFB',
              transition:'all .15s',
            }}>
            {file ? (
              <>
                <FileText size={28} style={{ color:'#15803D', marginBottom:8 }} />
                <p style={{ fontSize:14, fontWeight:600, color:'#15803D' }}>{file.name}</p>
                <p style={{ fontSize:12, color:'#16A34A', marginTop:2 }}>
                  {(file.size/1024).toFixed(0)} KB — ready to analyse
                </p>
              </>
            ) : (
              <>
                <Upload size={28} style={{ color:'#9CA3AF', marginBottom:8 }} />
                <p style={{ fontSize:14, fontWeight:600, color:'#374151' }}>
                  Drag &amp; drop your resume here
                </p>
                <p style={{ fontSize:12, color:'#9CA3AF', marginTop:2 }}>
                  PDF, DOC, or DOCX — or click to browse
                </p>
              </>
            )}
            <input type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={e => setFile(e.target.files?.[0] ?? null)} />
          </label>

          {/* Job ID */}
          <div style={{ marginTop:16 }}>
            <label className="form-label">Job ID</label>
            <input type="number" value={jobId} onChange={e => setJobId(e.target.value)}
              placeholder="Enter the Job ID from the Jobs page" className="field" />
          </div>

          {error && (
            <div style={{ marginTop:12, padding:'10px 14px', borderRadius:6,
                          background:'#FEF2F2', border:'1px solid #FECACA' }}>
              <p style={{ fontSize:13, color:'#B91C1C' }}>{error}</p>
            </div>
          )}

          <button onClick={run} disabled={!file||!jobId||loading}
            className="btn btn-primary"
            style={{ marginTop:16, width:'100%', borderRadius:8 }}>
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Analysing…</>
              : <><Zap size={15} />Analyse Match</>}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (() => {
        const t   = theme(result.score);
        const pct = Math.round(result.score * 100);
        return (
          <div className="card">
            <div className="section-header" style={{ background:t.bg, borderBottom:`1px solid ${t.border}` }}>
              <div>
                <h2 className="section-title" style={{ marginBottom:0 }}>Match Results</h2>
                <p style={{ fontSize:14, fontWeight:600, color:t.color, marginTop:2 }}>{t.label}</p>
              </div>
              <div style={{ width:64, height:64, borderRadius:'50%', border:`3px solid ${t.color}`,
                            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                            background:'#fff' }}>
                <span style={{ fontSize:20, fontWeight:700, color:t.color, lineHeight:1 }}>{pct}%</span>
              </div>
            </div>
            <div style={{ padding:20, display:'flex', flexDirection:'column', gap:16 }}>
              {/* Bar */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#9CA3AF', marginBottom:6 }}>
                  <span>Match score</span><span>{pct}%</span>
                </div>
                <div className="progress">
                  <div className="progress-fill" style={{ width:`${pct}%`, background:t.color }} />
                </div>
              </div>
              {/* Explanation */}
              <p style={{ fontSize:14, color:'#374151', lineHeight:1.65, padding:14,
                          background:'#F9FAFB', borderRadius:6, border:'1px solid #E5E7EB' }}>
                {result.explanation}
              </p>
              {/* Skills */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#15803D', marginBottom:8,
                               display:'flex', alignItems:'center', gap:4 }}>
                    <CheckCircle size={14} /> Matched ({result.matchedSkills.length})
                  </p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {result.matchedSkills.map(s => (
                      <span key={s} className="badge badge-green">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#B91C1C', marginBottom:8,
                               display:'flex', alignItems:'center', gap:4 }}>
                    <XCircle size={14} /> Missing ({result.missingSkills.length})
                  </p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {result.missingSkills.map(s => (
                      <span key={s} className="badge badge-red">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
