import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, type LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  accent: 'primary' | 'accent' | 'success';
  delay?: number;
}

const accentMap = {
  primary: { bg: 'bg-primary-600', soft: 'bg-primary-50', text: 'text-primary-600', ring: 'group-hover:ring-primary-200' },
  accent: { bg: 'bg-accent-500', soft: 'bg-accent-50', text: 'text-accent-600', ring: 'group-hover:ring-accent-200' },
  success: { bg: 'bg-success-500', soft: 'bg-success-50', text: 'text-success-600', ring: 'group-hover:ring-success-200' },
};

export default function FeatureCard({ title, description, icon: Icon, to, accent, delay = 0 }: FeatureCardProps) {
  const a = accentMap[accent];
  const navigate = useNavigate();
  return (
    <motion.button
      type="button"
      onClick={() => navigate(to)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className={`card-base card-hover group p-6 relative overflow-hidden block text-left w-full`}
    >
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${a.soft} opacity-60 transition-transform duration-500 group-hover:scale-150`} />
      <div className="relative">
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${a.bg} text-white shadow-sm`}>
          <Icon size={22} strokeWidth={2.2} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-neutral-800">{title}</h3>
        <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed">{description}</p>
        <div className={`mt-4 inline-flex items-center gap-1.5 text-sm font-medium ${a.text} group-hover:gap-2.5 transition-all`}>
          Explore <ArrowRight size={16} />
        </div>
      </div>
    </motion.button>
  );
}
