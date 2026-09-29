export type Platform = 'Twitter' | 'Facebook' | 'Reddit' | 'Instagram' | 'YouTube' | 'TikTok';
export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface TrendSummary {
  totalPosts: number;
  trendingTopics: number;
  trendingHashtags: number;
  platformsMonitored: number;
}

export interface TrendItem {
  id: string;
  topic: string;
  hashtag: string;
  description: string;
  image: string;
  posts: number;
  platform: Platform;
  sentimentPositive: number;
  sentimentNegative: number;
  sentimentNeutral: number;
  firstDetected: string;
  growth: number;
}

export interface TrendDetail {
  id: string;
  topic: string;
  totalPosts: number;
  mostActivePlatform: Platform;
  firstDetected: string;
  description: string;
  sentiment: { positive: number; negative: number; neutral: number };
  hourlyTrend: { hour: string; posts: number }[];
  dailyTrend: { day: string; posts: number }[];
  keywords: string[];
  posts: TrendPost[];
}

export interface TrendPost {
  id: string;
  platform: Platform;
  author: string;
  content: string;
  sentiment: Sentiment;
  timestamp: string;
  engagement: number;
}

export interface RecentTrendRow {
  platform: Platform;
  topic: string;
  time: string;
}

export interface DetectionResult {
  id: string;
  text: string;
  fakeProbability: number;
  realProbability: number;
  label: 'Fake' | 'Real' | 'Uncertain';
  confidence: number;
  flaggedPhrases: string[];
  timestamp: string;
}

export interface ModelMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
}

export interface ModelHealth {
  accuracy: ModelMetric;
  precision: ModelMetric;
  recall: ModelMetric;
  f1Score: ModelMetric;
  latency: ModelMetric;
  uptime: ModelMetric;
  lastTrained: string;
  version: string;
  status: 'operational' | 'degraded' | 'down';
}
