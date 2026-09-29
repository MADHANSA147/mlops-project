import type { Sentiment } from '@/services/types';

const sentimentMap: Record<Sentiment, { label: string; cls: string; dot: string }> = {
  positive: { label: 'Positive', cls: 'bg-success-50 text-success-700', dot: 'bg-success-500' },
  negative: { label: 'Negative', cls: 'bg-error-50 text-error-700', dot: 'bg-error-500' },
  neutral: { label: 'Neutral', cls: 'bg-neutral-100 text-neutral-600', dot: 'bg-neutral-400' },
};

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const s = sentimentMap[sentiment];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

interface BadgeProps {
  label: string;
  tone?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
}

const toneMap = {
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  error: 'bg-error-50 text-error-700',
  neutral: 'bg-neutral-100 text-neutral-600',
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${toneMap[tone]}`}>
      {label}
    </span>
  );
}
