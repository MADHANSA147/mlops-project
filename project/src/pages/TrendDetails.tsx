import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ArrowLeft, MessageSquare, Activity, Calendar, Hash, TrendingUp } from 'lucide-react';
import { endpoints } from '@/services/api';
import { getTrendDetail as getMockDetail } from '@/services/mockData';
import { SentimentBadge } from '@/components/Badges';
import ChartCard from '@/components/ChartCard';
import Loader from '@/components/Loader';
import type { TrendDetail as TrendDetailType } from '@/services/types';

const platformIcon: Record<string, string> = {
  Twitter: '𝕏', Reddit: 'R', Facebook: 'f', Instagram: 'IG', YouTube: 'YT', TikTok: 'TT',
};

export default function TrendDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<TrendDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const topicId = id ?? 'trend-001';
    endpoints.trends.details(topicId)
      .then((res) => setDetail(res.data))
      .catch(() => setDetail(getMockDetail(topicId)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !detail) return <Loader label="Loading trend details..." fullHeight />;

  const sentimentData = [
    { name: 'Positive', value: detail.sentiment.positive, color: '#10B981' },
    { name: 'Negative', value: detail.sentiment.negative, color: '#EF4444' },
    { name: 'Neutral', value: detail.sentiment.neutral, color: '#94A3B8' },
  ];

  const overview = [
    { label: 'Total Posts', value: detail.totalPosts.toLocaleString(), icon: MessageSquare, accent: 'bg-primary-50 text-primary-600' },
    { label: 'Most Active Platform', value: detail.mostActivePlatform, icon: Activity, accent: 'bg-accent-50 text-accent-600' },
    { label: 'First Detected', value: new Date(detail.firstDetected).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), icon: Calendar, accent: 'bg-success-50 text-success-600' },
    { label: 'Growth Rate', value: '+34%', icon: TrendingUp, accent: 'bg-warning-50 text-warning-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={() => navigate('/trends')}
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-600 transition-colors font-medium"
      >
        <ArrowLeft size={16} /> Back to Trends
      </button>

      {/* Header */}
      <div className="card-base p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-md bg-primary-50 text-primary-700 text-xs font-bold">
            {platformIcon[detail.mostActivePlatform]}
          </span>
          <span className="text-sm text-neutral-500">{detail.mostActivePlatform}</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">{detail.topic}</h1>
        <p className="mt-2 text-neutral-500 leading-relaxed max-w-3xl">{detail.description}</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overview.map((o, i) => (
          <motion.div
            key={o.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-base p-4"
          >
            <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${o.accent} mb-3`}>
              <o.icon size={18} />
            </div>
            <p className="text-xs text-neutral-500 font-medium">{o.label}</p>
            <p className="mt-1 text-lg font-bold text-neutral-800">{o.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Sentiment analysis */}
      <div className="card-base p-5">
        <h3 className="text-base font-semibold text-neutral-800 mb-4">Sentiment Analysis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col gap-3">
            {sentimentData.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-neutral-700">{s.name}</span>
                  <span className="font-semibold text-neutral-800">{s.value}%</span>
                </div>
                <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.value}%` }}
                    transition={{ duration: 0.7 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {sentimentData.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Hourly Trend" subtitle="Posts per 4-hour window">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={detail.hourlyTrend} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Line type="monotone" dataKey="posts" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Trend" subtitle="Posts per day of week">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={detail.dailyTrend} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} cursor={{ fill: '#F8FAFC' }} />
              <Bar dataKey="posts" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Keywords */}
      <div className="card-base p-5">
        <h3 className="text-base font-semibold text-neutral-800 mb-3 flex items-center gap-2">
          <Hash size={16} className="text-primary-600" /> Top Keywords
        </h3>
        <div className="flex flex-wrap gap-2">
          {detail.keywords.map((k) => (
            <span key={k} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-lg font-medium border border-primary-100">
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* Recent posts */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Recent Posts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {detail.posts.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card-base p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-neutral-100 text-neutral-600 text-xs font-bold">
                    {platformIcon[p.platform]}
                  </span>
                  <span className="text-sm font-medium text-neutral-700">{p.author}</span>
                </span>
                <SentimentBadge sentiment={p.sentiment} />
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">{p.content}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                <span>{p.engagement.toLocaleString()} engagements</span>
                <span>{new Date(p.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
