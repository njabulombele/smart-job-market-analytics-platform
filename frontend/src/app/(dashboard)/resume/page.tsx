'use client';

import { useState } from 'react';
import { aiApi } from '@/lib/api';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';

interface MatchResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  explanation: string;
}

export default function ResumeMatchPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState('');
  const [result, setResult] = useState<MatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!file || !jobId) return;

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobId', jobId);

    setIsLoading(true);
    setError('');
    try {
      const { data } = await aiApi.matchResume(formData);
      setResult(data);
    } catch {
      setError('Match failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.5) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resume Matcher</h1>
        <p className="text-gray-500">Upload your CV and match it against any job posting</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {/* File upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Resume (PDF)</label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-blue-400 transition">
            <Upload className="text-gray-400 mb-2" size={28} />
            <span className="text-sm text-gray-500">
              {file ? file.name : 'Click to upload or drag & drop'}
            </span>
            <input type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>

        {/* Job ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job ID</label>
          <input
            type="number"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            placeholder="Enter job ID to match against"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!file || !jobId || isLoading}
          className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 disabled:opacity-50 transition">
          {isLoading ? 'Analyzing...' : 'Match Resume'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Match Results</h2>
            <span className={`text-3xl font-bold rounded-xl px-4 py-2 ${scoreColor(result.score)}`}>
              {Math.round(result.score * 100)}%
            </span>
          </div>

          <p className="text-gray-600 text-sm bg-gray-50 rounded-lg p-3">{result.explanation}</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-green-700 flex items-center gap-1 mb-2">
                <CheckCircle size={15} /> Matched Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedSkills.map(s => (
                  <span key={s} className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-700 flex items-center gap-1 mb-2">
                <XCircle size={15} /> Missing Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {result.missingSkills.map(s => (
                  <span key={s} className="text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
