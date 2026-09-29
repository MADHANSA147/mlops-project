import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function ChartCard({ title, subtitle, children, delay = 0, className = '' }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`card-base p-5 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-neutral-800">{title}</h3>
        {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}
