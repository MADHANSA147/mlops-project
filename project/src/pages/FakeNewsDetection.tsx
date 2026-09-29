import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScanSearch, Sparkles, AlertTriangle, CheckCircle2, HelpCircle, Clock } from 'lucide-react';
import { endpoints } from '@/services/api';
import { analyzeText as mockAnalyze, detectionHistory as mockHistory } from '@/services/mockData';
import type { DetectionResult } from '@/services/types';
import { Badge } from '@/components/Badges';

export default function FakeNewsDetection() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [history, setHistory] = useState<DetectionResult[]>(mockHistory);
  const [loading, setLoading] = useState(false);

  // Fetch history on mount
  useEffect(() => {
    endpoints.detection.history()
      .then((res) => {
        const preds = res.data.predictions;
        if (preds && preds.length > 0) {
          setHistory(preds);
        }
      })
      .catch(() => { /* keep mock history */ });
  }, []);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await endpoints.detection.analyze(text);
      const r = res.data;
      setResult(r);
      // Prepend to local history
      setHistory((prev) => [r, ...prev].slice(0, 20));
    } catch {
      // Fall back to mock analysis
      const mockResult = mockAnalyze(text);
      setResult(mockResult);
      setHistory((prev) => [mockResult, ...prev].slice(0, 20));
    } finally {
      setLoading(false);
    }
  };

  const labelConfig = {
    Fake: { icon: AlertTriangle, tone: 'error' as const, bg: 'bg-error-50', text: 'text-error-700', border: 'border-error-200' },
    Real: { icon: CheckCircle2, tone: 'success' as const, bg: 'bg-success-50', text: 'text-success-700', border: 'border-success-200' },
    Uncertain: { icon: HelpCircle, tone: 'warning' as const, bg: 'bg-warning-50', text: 'text-warning-700', border: 'border-warning-200' },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">Fake News Detection</h1>
        <p className="mt-1 text-neutral-500">Paste any text below to assess its credibility using the AI detection model.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Editor */}
        <div className="lg:col-span-3 card-base p-5">
          <label className="block text-sm font-semibold text-neutral-700 mb-2">Input text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste a news article, social media post, or any claim you want to verify..."
            rows={10}
            className="w-full p-4 text-sm bg-neutral-50 border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-primary-500 transition-colors leading-relaxed"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-neutral-400">{text.length} characters</span>
            <button
              onClick={handleAnalyze}
              disabled={!text.trim() || loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" />
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <ScanSearch size={16} /> Analyze
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="lg:col-span-2 card-base p-5">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-primary-600" /> Detection Result
          </h3>
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-neutral-100 text-neutral-400 mb-3">
                <ScanSearch size={24} />
              </div>
              <p className="text-sm text-neutral-400">Results will appear here after analysis.</p>
            </div>
          )}
          {loading && (
            <div className="flex flex-col items-center justify-center h-64">
              <svg className="animate-spin text-primary-600" width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" />
              </svg>
              <p className="mt-3 text-sm text-neutral-500">Running model inference...</p>
            </div>
          )}
          {result && !loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {(() => {
                const cfg = labelConfig[result.label];
                const Icon = cfg.icon;
                return (
                  <div className={`p-4 rounded-lg ${cfg.bg} ${cfg.border} border flex items-center gap-3`}>
                    <Icon size={24} className={cfg.text} />
                    <div>
                      <p className={`font-bold text-lg ${cfg.text}`}>{result.label}</p>
                      <p className="text-xs text-neutral-500">Confidence: {Math.round(result.confidence * 100)}%</p>
                    </div>
                  </div>
                );
              })()}

              <div className="mt-5 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-error-600">Fake probability</span>
                    <span className="font-semibold text-error-600">{result.fakeProbability}%</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.fakeProbability}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full bg-error-500 rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-success-600">Real probability</span>
                    <span className="font-semibold text-success-600">{result.realProbability}%</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.realProbability}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full bg-success-500 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {result.flaggedPhrases.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold text-neutral-700 mb-2">Flagged phrases</p>
                  <div className="flex flex-wrap gap-2">
                    {result.flaggedPhrases.map((p) => (
                      <span key={p} className="px-2.5 py-1 bg-error-50 text-error-700 text-xs rounded-md font-medium border border-error-200">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* History */}
      <div className="card-base overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h3 className="text-base font-semibold text-neutral-800">Recent analyses</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left text-xs text-neutral-500 uppercase tracking-wider">
                <th className="px-5 py-3 font-semibold">Text</th>
                <th className="px-5 py-3 font-semibold">Label</th>
                <th className="px-5 py-3 font-semibold">Confidence</th>
                <th className="px-5 py-3 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {history.map((r) => {
                const cfg = labelConfig[r.label];
                return (
                  <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3.5 max-w-md">
                      <p className="text-neutral-700 line-clamp-2">{r.text}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge label={r.label} tone={cfg.tone} />
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600 font-medium">{Math.round(r.confidence * 100)}%</td>
                    <td className="px-5 py-3.5 text-neutral-500 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} /> {new Date(r.timestamp).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
