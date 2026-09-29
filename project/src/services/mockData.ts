import type {
  TrendSummary,
  TrendItem,
  TrendDetail,
  RecentTrendRow,
  DetectionResult,
  ModelHealth,
  Platform,
} from './types';

export const trendSummary: TrendSummary = {
  totalPosts: 1284530,
  trendingTopics: 42,
  trendingHashtags: 187,
  platformsMonitored: 6,
};

const trendImages = [
  'https://images.pexels.com/photos/5475750/pexels-photo-5475750.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/163064/smartphone-mobile-phone-iphone-communications-163064.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/905163/pexels-photo-905163.jpeg?auto=compress&cs=tinysrgb&w=800',
];

export const trendItems: TrendItem[] = [
  {
    id: 'trend-001',
    topic: 'AI Regulation Bill Passes Senate',
    hashtag: '#AIRegulation',
    description:
      'Landmark legislation establishing guardrails for artificial intelligence development clears a key procedural vote amid intense debate.',
    image: trendImages[0],
    posts: 184320,
    platform: 'Twitter',
    sentimentPositive: 52,
    sentimentNegative: 31,
    sentimentNeutral: 17,
    firstDetected: '2026-07-19T08:12:00Z',
    growth: 34,
  },
  {
    id: 'trend-002',
    topic: 'Global Climate Summit Reaches Accord',
    hashtag: '#ClimateAction',
    description:
      'Nations agree on a binding framework to phase down fossil fuel subsidies by 2030, drawing mixed reactions online.',
    image: trendImages[1],
    posts: 142880,
    platform: 'Twitter',
    sentimentPositive: 61,
    sentimentNegative: 22,
    sentimentNeutral: 17,
    firstDetected: '2026-07-18T14:30:00Z',
    growth: 28,
  },
  {
    id: 'trend-003',
    topic: 'Major Tech Layoffs Announced',
    hashtag: '#TechLayoffs',
    description:
      'A leading software company confirms restructuring affecting 8% of its workforce, reigniting debate over remote work policies.',
    image: trendImages[2],
    posts: 98740,
    platform: 'Reddit',
    sentimentPositive: 18,
    sentimentNegative: 64,
    sentimentNeutral: 18,
    firstDetected: '2026-07-20T11:05:00Z',
    growth: 47,
  },
  {
    id: 'trend-004',
    topic: 'New Vaccine Shows 94% Efficacy',
    hashtag: '#MedicalBreakthrough',
    description:
      'Phase III trial results for a next-generation vaccine exceed expectations, with regulators promising expedited review.',
    image: trendImages[3],
    posts: 76210,
    platform: 'Facebook',
    sentimentPositive: 71,
    sentimentNegative: 14,
    sentimentNeutral: 15,
    firstDetected: '2026-07-20T06:45:00Z',
    growth: 19,
  },
  {
    id: 'trend-005',
    topic: 'Cryptocurrency Market Volatility Spikes',
    hashtag: '#CryptoCrash',
    description:
      'A sudden 12% overnight drop triggers liquidations across major exchanges, with analysts divided on the cause.',
    image: trendImages[4],
    posts: 64530,
    platform: 'Twitter',
    sentimentPositive: 12,
    sentimentNegative: 73,
    sentimentNeutral: 15,
    firstDetected: '2026-07-21T02:20:00Z',
    growth: 58,
  },
  {
    id: 'trend-006',
    topic: 'Space Mission Returns First Samples',
    hashtag: '#SpaceExploration',
    description:
      'A robotic probe successfully delivers pristine asteroid material to Earth, opening a new chapter in planetary science.',
    image: trendImages[5],
    posts: 51280,
    platform: 'YouTube',
    sentimentPositive: 83,
    sentimentNegative: 6,
    sentimentNeutral: 11,
    firstDetected: '2026-07-17T19:00:00Z',
    growth: 22,
  },
];

function buildHourly(base: number): { hour: string; posts: number }[] {
  const hours = ['00', '04', '08', '12', '16', '20'];
  return hours.map((h, i) => ({
    hour: `${h}:00`,
    posts: Math.round(base * (0.4 + Math.sin(i * 1.1) * 0.3 + i * 0.08)),
  }));
}

function buildDaily(base: number): { day: string; posts: number }[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((d, i) => ({
    day: d,
    posts: Math.round(base * (0.6 + Math.cos(i * 0.9) * 0.25 + i * 0.04)),
  }));
}

export function getTrendDetail(id: string): TrendDetail {
  const item = trendItems.find((t) => t.id === id) ?? trendItems[0];
  const platforms: Platform[] = ['Twitter', 'Facebook', 'Reddit', 'Instagram', 'YouTube', 'TikTok'];
  return {
    id: item.id,
    topic: item.topic,
    totalPosts: item.posts,
    mostActivePlatform: item.platform,
    firstDetected: item.firstDetected,
    description: item.description,
    sentiment: {
      positive: item.sentimentPositive,
      negative: item.sentimentNegative,
      neutral: item.sentimentNeutral,
    },
    hourlyTrend: buildHourly(item.posts / 6),
    dailyTrend: buildDaily(item.posts / 7),
    keywords: [
      item.hashtag.replace('#', ''),
      'policy',
      'breaking',
      'analysis',
      'public',
      'reaction',
      'update',
      'debate',
    ],
    posts: Array.from({ length: 8 }).map((_, i) => {
      const sentiments: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral'];
      const sentiment = sentiments[i % 3];
      return {
        id: `${item.id}-post-${i}`,
        platform: platforms[i % platforms.length],
        author: `@user_${1000 + i * 37}`,
        content:
          i % 2 === 0
            ? `Strong opinions on ${item.topic.toLowerCase()}. The discussion around ${item.hashtag} is moving fast.`
            : `Just saw the latest on ${item.hashtag}. This changes the conversation significantly.`,
        sentiment,
        timestamp: `2026-07-2${1 - (i % 3)}T${10 + i}:00:00Z`,
        engagement: 1200 - i * 95,
      };
    }),
  };
}

export const recentTrendRows: RecentTrendRow[] = [
  { platform: 'Twitter', topic: '#AIRegulation', time: '2 min ago' },
  { platform: 'Reddit', topic: '#TechLayoffs', time: '8 min ago' },
  { platform: 'Facebook', topic: '#MedicalBreakthrough', time: '14 min ago' },
  { platform: 'Twitter', topic: '#CryptoCrash', time: '21 min ago' },
  { platform: 'YouTube', topic: '#SpaceExploration', time: '33 min ago' },
  { platform: 'Instagram', topic: '#ClimateAction', time: '47 min ago' },
  { platform: 'TikTok', topic: '#ViralUpdate', time: '1 hr ago' },
  { platform: 'Twitter', topic: '#ElectionNews', time: '1 hr ago' },
];

export const trendingTopicsLine = [
  { time: 'Mon', Twitter: 4200, Reddit: 2100, Facebook: 1800 },
  { time: 'Tue', Twitter: 5100, Reddit: 2400, Facebook: 1900 },
  { time: 'Wed', Twitter: 4800, Reddit: 2800, Facebook: 1700 },
  { time: 'Thu', Twitter: 6200, Reddit: 3100, Facebook: 2200 },
  { time: 'Fri', Twitter: 7400, Reddit: 2900, Facebook: 2400 },
  { time: 'Sat', Twitter: 6800, Reddit: 2600, Facebook: 2000 },
  { time: 'Sun', Twitter: 7900, Reddit: 3300, Facebook: 2300 },
];

export const topHashtagsBar = [
  { hashtag: '#AIRegulation', count: 184320 },
  { hashtag: '#ClimateAction', count: 142880 },
  { hashtag: '#TechLayoffs', count: 98740 },
  { hashtag: '#MedicalBreakthrough', count: 76210 },
  { hashtag: '#CryptoCrash', count: 64530 },
  { hashtag: '#SpaceExploration', count: 51280 },
];

export const platformDistribution = [
  { name: 'Twitter', value: 38, color: '#2563EB' },
  { name: 'Reddit', value: 22, color: '#F59E0B' },
  { name: 'Facebook', value: 18, color: '#10B981' },
  { name: 'Instagram', value: 12, color: '#EF4444' },
  { name: 'YouTube', value: 6, color: '#8B5CF6' },
  { name: 'TikTok', value: 4, color: '#06B6D4' },
];

export const dailyActivityArea = [
  { day: 'Mon', posts: 8200 },
  { day: 'Tue', posts: 9400 },
  { day: 'Wed', posts: 9100 },
  { day: 'Thu', posts: 11500 },
  { day: 'Fri', posts: 12700 },
  { day: 'Sat', posts: 11400 },
  { day: 'Sun', posts: 13200 },
];

export const detectionHistory: DetectionResult[] = [
  {
    id: 'det-001',
    text: 'A government source confirmed that all public transport will be free starting next month.',
    fakeProbability: 78,
    realProbability: 22,
    label: 'Fake',
    confidence: 0.78,
    flaggedPhrases: ['government source confirmed', 'all public transport will be free'],
    timestamp: '2026-07-21T09:12:00Z',
  },
  {
    id: 'det-002',
    text: 'The central bank raised its benchmark interest rate by 25 basis points at todays policy meeting.',
    fakeProbability: 12,
    realProbability: 88,
    label: 'Real',
    confidence: 0.88,
    flaggedPhrases: [],
    timestamp: '2026-07-20T16:40:00Z',
  },
  {
    id: 'det-003',
    text: 'Scientists discovered that drinking lemon water cures all forms of cancer overnight.',
    fakeProbability: 96,
    realProbability: 4,
    label: 'Fake',
    confidence: 0.96,
    flaggedPhrases: ['cures all forms of cancer', 'overnight'],
    timestamp: '2026-07-19T20:05:00Z',
  },
];

export function analyzeText(text: string): DetectionResult {
  const lower = text.toLowerCase();
  const suspicious = [
    'cures all',
    'overnight',
    'government source confirmed',
    'they dont want you to know',
    'miracle',
    'secret cure',
    '100% guaranteed',
    'mainstream media hiding',
  ];
  const flagged = suspicious.filter((p) => lower.includes(p));
  const fakeProbability = Math.min(95, 30 + flagged.length * 18 + (text.length < 40 ? 15 : 0));
  const realProbability = 100 - fakeProbability;
  const label = fakeProbability >= 60 ? 'Fake' : fakeProbability <= 35 ? 'Real' : 'Uncertain';
  return {
    id: `det-${Date.now()}`,
    text,
    fakeProbability,
    realProbability,
    label,
    confidence: Math.max(fakeProbability, realProbability) / 100,
    flaggedPhrases: flagged,
    timestamp: new Date().toISOString(),
  };
}

export const modelHealth: ModelHealth = {
  accuracy: { name: 'Accuracy', value: 94.2, target: 95, unit: '%', status: 'healthy' },
  precision: { name: 'Precision', value: 91.8, target: 90, unit: '%', status: 'healthy' },
  recall: { name: 'Recall', value: 88.5, target: 90, unit: '%', status: 'warning' },
  f1Score: { name: 'F1 Score', value: 90.1, target: 90, unit: '%', status: 'healthy' },
  latency: { name: 'Avg Latency', value: 142, target: 200, unit: 'ms', status: 'healthy' },
  uptime: { name: 'Uptime', value: 99.97, target: 99.9, unit: '%', status: 'healthy' },
  lastTrained: '2026-07-18T03:00:00Z',
  version: 'v2.4.1',
  status: 'operational',
};
