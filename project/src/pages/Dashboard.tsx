import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScanSearch, TrendingUp, FileBarChart, ShieldCheck, Activity, Zap } from 'lucide-react';
import SummaryCard from '@/components/SummaryCard';
import FeatureCard from '@/components/FeatureCard';
import { endpoints } from '@/services/api';

interface DashboardData {
  postsAnalyzed: string;
  activeTrends: number;
  fakeNewsFlagged: number;
  modelAccuracy: string;
  postsAnalyzedTrend: string;
  activeTrendsTrend: string;
  fakeNewsFlaggedTrend: string;
  modelAccuracyTrend: string;
}

const defaultData: DashboardData = {
  postsAnalyzed: '1.28M',
  activeTrends: 42,
  fakeNewsFlagged: 318,
  modelAccuracy: '94.2%',
  postsAnalyzedTrend: '12.4%',
  activeTrendsTrend: '8.1%',
  fakeNewsFlaggedTrend: '5.7%',
  modelAccuracyTrend: '0.3%',
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>(defaultData);
  const user = JSON.parse(localStorage.getItem('veritas_user') || '{"name":"Alex"}');

  useEffect(() => {
    endpoints.dashboard.summary()
      .then((res) => setData(res.data))
      .catch(() => { /* keep defaults */ });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">Welcome back, {user.name?.split(' ')[0] || 'Alex'}</h1>
        <p className="mt-1 text-neutral-500">Here&apos;s what&apos;s happening across your monitored platforms today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Posts Analyzed" value={data.postsAnalyzed} icon={FileBarChart} trend={data.postsAnalyzedTrend} trendUp accent="primary" delay={0} />
        <SummaryCard title="Active Trends" value={data.activeTrends} icon={TrendingUp} trend={data.activeTrendsTrend} trendUp accent="accent" delay={0.05} />
        <SummaryCard title="Fake News Flagged" value={data.fakeNewsFlagged} icon={ShieldCheck} trend={data.fakeNewsFlaggedTrend} trendUp accent="warning" delay={0.1} />
        <SummaryCard title="Model Accuracy" value={data.modelAccuracy} icon={Activity} trend={data.modelAccuracyTrend} trendUp accent="success" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FeatureCard
          title="Fake News Detection"
          description="Paste any article or social post and let the AI model assess its credibility with probability scoring and flagged phrases."
          icon={ScanSearch}
          to="/detection"
          accent="primary"
          delay={0.1}
        />
        <FeatureCard
          title="Social Media Trend Analysis"
          description="Track trending topics, hashtags, and sentiment across six major platforms with hourly granularity."
          icon={TrendingUp}
          to="/trends"
          accent="accent"
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Zap, title: 'Real-time ingestion', desc: 'Posts streamed and scored within seconds of publication.', accent: 'primary' as const },
          { icon: ShieldCheck, title: 'Misinformation defense', desc: 'Catch coordinated disinformation campaigns before they spread.', accent: 'success' as const },
          { icon: Activity, title: 'Model monitoring', desc: 'Continuous health checks on accuracy, latency, and uptime.', accent: 'warning' as const },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
            className="card-base p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${
                f.accent === 'primary' ? 'bg-primary-50 text-primary-600' :
                f.accent === 'success' ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600'
              }`}>
                <f.icon size={18} />
              </div>
              <h3 className="font-semibold text-neutral-800 text-sm">{f.title}</h3>
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
