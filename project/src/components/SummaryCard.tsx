import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  accent?: 'primary' | 'success' | 'warning' | 'error' | 'accent';
  delay?: number;
}

const accentMap = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-600', ring: 'group-hover:ring-primary-200' },
  accent: { bg: 'bg-accent-50', text: 'text-accent-600', ring: 'group-hover:ring-accent-200' },
  success: { bg: 'bg-success-50', text: 'text-success-600', ring: 'group-hover:ring-success-200' },
  warning: { bg: 'bg-warning-50', text: 'text-warning-600', ring: 'group-hover:ring-warning-200' },
  error: { bg: 'bg-error-50', text: 'text-error-600', ring: 'group-hover:ring-error-200' },
};

export default function SummaryCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp = true,
  accent = 'primary',
  delay = 0,
}: SummaryCardProps) {
  const a = accentMap[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card-base card-hover group p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-neutral-800 tracking-tight">{value}</p>
        </div>
        <div
          className={`flex items-center justify-center w-11 h-11 rounded-xl ${a.bg} ${a.text} ring-1 ring-transparent ${a.ring} transition-all`}
        >
          <Icon size={20} strokeWidth={2.2} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className={trendUp ? 'text-success-600 font-semibold' : 'text-error-600 font-semibold'}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
          <span className="text-neutral-400">vs last week</span>
        </div>
      )}
    </motion.div>
  );
}
