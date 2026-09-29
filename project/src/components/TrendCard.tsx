import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, MessageCircle } from 'lucide-react';
import type { TrendItem } from '@/services/types';

interface TrendCardProps {
  trend: TrendItem;
  delay?: number;
}

const platformColor: Record<string, string> = {
  Twitter: 'bg-primary-50 text-primary-700',
  Reddit: 'bg-warning-50 text-warning-700',
  Facebook: 'bg-success-50 text-success-700',
  Instagram: 'bg-error-50 text-error-700',
  YouTube: 'bg-[#F3E8FF] text-[#7C3AED]',
  TikTok: 'bg-[#CFFAFE] text-[#0891B2]',
};

export default function TrendCard({ trend, delay = 0 }: TrendCardProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/trends/${trend.id}`)}
      className="card-base card-hover group overflow-hidden text-left w-full"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={trend.image}
          alt={trend.topic}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-neutral-900/10 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${platformColor[trend.platform]}`}>
            {trend.platform}
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/90 text-success-700 flex items-center gap-1">
            <TrendingUp size={12} /> +{trend.growth}%
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white font-semibold text-sm leading-snug line-clamp-2">{trend.topic}</p>
          <p className="text-white/80 text-xs mt-0.5 font-medium">{trend.hashtag}</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-neutral-600 leading-relaxed line-clamp-2">{trend.description}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1.5">
            <MessageCircle size={13} /> {trend.posts.toLocaleString()} posts
          </span>
          <span className="text-primary-600 font-medium group-hover:underline">View details →</span>
        </div>
      </div>
    </motion.button>
  );
}
