import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Hash, MessageSquare, TrendingUp, MonitorSmartphone } from 'lucide-react';
import SummaryCard from '@/components/SummaryCard';
import ChartCard from '@/components/ChartCard';
import TrendCard from '@/components/TrendCard';
import Loader from '@/components/Loader';
import { endpoints } from '@/services/api';
import {
  trendSummary as mockSummary, trendItems as mockItems, recentTrendRows as mockRows,
  trendingTopicsLine as mockLine, topHashtagsBar as mockBar,
  platformDistribution as mockPlatform, dailyActivityArea as mockActivity,
} from '@/services/mockData';
import type { TrendSummary, TrendItem, RecentTrendRow } from '@/services/types';

const platformIcon: Record<string, string> = {
  Twitter: '𝕏', Reddit: 'R', Facebook: 'f', Instagram: 'IG', YouTube: 'YT', TikTok: 'TT',
};

export default function TrendAnalysis() {
  const [summary, setSummary] = useState<TrendSummary>(mockSummary);
  const [items, setItems] = useState<TrendItem[]>(mockItems);
  const [recentRows, setRecentRows] = useState<RecentTrendRow[]>(mockRows);
  const [topicsLine, setTopicsLine] = useState(mockLine);
  const [hashtagsBar, setHashtagsBar] = useState(mockBar);
  const [platformDist, setPlatformDist] = useState(mockPlatform);
  const [dailyActivity, setDailyActivity] = useState(mockActivity);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    endpoints.trends.list()
      .then((res) => {
        const d = res.data;
        setSummary(d.summary);
        setItems(d.items);
        setRecentRows(d.recentRows);
        if (d.charts) {
          setTopicsLine(d.charts.topicsLine);
          setHashtagsBar(d.charts.hashtagsBar);
          setPlatformDist(d.charts.platformDistribution);
          setDailyActivity(d.charts.dailyActivity);
        }
      })
      .catch(() => { /* keep mock data */ })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading trend data..." fullHeight />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">Social Media Trend Analysis</h1>
        <p className="mt-1 text-neutral-500">Track trending topics, hashtags, and sentiment across monitored platforms in real time.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total Posts Collected" value={summary.totalPosts.toLocaleString()} icon={MessageSquare} trend="12.4%" trendUp accent="primary" delay={0} />
        <SummaryCard title="Trending Topics" value={summary.trendingTopics} icon={TrendingUp} trend="8.1%" trendUp accent="accent" delay={0.05} />
        <SummaryCard title="Trending Hashtags" value={summary.trendingHashtags} icon={Hash} trend="5.3%" trendUp accent="success" delay={0.1} />
        <SummaryCard title="Platforms Monitored" value={summary.platformsMonitored} icon={MonitorSmartphone} accent="warning" delay={0.15} />
      </div>

      {/* Trending news cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-800">Trending Now</h2>
          <span className="text-sm text-neutral-500">{items.length} active trends</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <TrendCard key={t.id} trend={t} delay={i * 0.05} />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Trending Topics Over Time" subtitle="Posts per platform across the week" delay={0}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={topicsLine} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Twitter" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="Reddit" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Facebook" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Hashtags" subtitle="By total post volume" delay={0.05}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={hashtagsBar} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="hashtag" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={120} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} cursor={{ fill: '#F8FAFC' }} />
              <Bar dataKey="count" fill="#2563EB" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Platform Distribution" subtitle="Share of monitored posts" delay={0.1}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={platformDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {platformDist.map((entry: any) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Activity" subtitle="Total posts collected per day" delay={0.15}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyActivity} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Area type="monotone" dataKey="posts" stroke="#2563EB" strokeWidth={2.5} fill="url(#activityGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent posts table */}
      <div className="card-base overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h3 className="text-base font-semibold text-neutral-800">Recent Trending Posts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left text-xs text-neutral-500 uppercase tracking-wider">
                <th className="px-5 py-3 font-semibold">Platform</th>
                <th className="px-5 py-3 font-semibold">Topic</th>
                <th className="px-5 py-3 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recentRows.map((row, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-md bg-primary-50 text-primary-700 text-xs font-bold">
                        {platformIcon[row.platform]}
                      </span>
                      <span className="text-neutral-700 font-medium">{row.platform}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-primary-600 font-medium">{row.topic}</td>
                  <td className="px-5 py-3.5 text-neutral-500">{row.time}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
