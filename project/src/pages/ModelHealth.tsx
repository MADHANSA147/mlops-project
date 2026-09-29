import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Clock, CheckCircle2, AlertTriangle, XCircle, Gauge, ShieldCheck } from 'lucide-react';
import { endpoints } from '@/services/api';
import { modelHealth as mockHealth } from '@/services/mockData';
import type { ModelMetric, ModelHealth as ModelHealthType } from '@/services/types';
import ChartCard from '@/components/ChartCard';

function CircularProgress({ value, target, unit, status }: ModelMetric) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, (value / (unit === '%' ? 100 : target * 2)) * 100);
  const offset = circumference - (pct / 100) * circumference;
  const color = status === 'healthy' ? '#10B981' : status === 'warning' ? '#F59E0B' : '#EF4444';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="10" />
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-neutral-800">{value}{unit}</span>
          <span className="text-xs text-neutral-400 mt-0.5">target {target}{unit}</span>
        </div>
      </div>
    </div>
  );
}

const statusConfig = {
  operational: { icon: CheckCircle2, label: 'Operational', cls: 'bg-success-50 text-success-700 border-success-200' },
  degraded: { icon: AlertTriangle, label: 'Degraded', cls: 'bg-warning-50 text-warning-700 border-warning-200' },
  down: { icon: XCircle, label: 'Down', cls: 'bg-error-50 text-error-700 border-error-200' },
};

const metricStatusConfig = {
  healthy: { icon: CheckCircle2, cls: 'bg-success-50 text-success-700' },
  warning: { icon: AlertTriangle, cls: 'bg-warning-50 text-warning-700' },
  critical: { icon: XCircle, cls: 'bg-error-50 text-error-700' },
};

export default function ModelHealth() {
  const [health, setHealth] = useState<ModelHealthType>(mockHealth);

  useEffect(() => {
    endpoints.model.health()
      .then((res) => setHealth(res.data))
      .catch(() => { /* keep mock data */ });
  }, []);

  const status = statusConfig[health.status];
  const StatusIcon = status.icon;
  const metrics = [health.accuracy, health.precision, health.recall, health.f1Score, health.latency, health.uptime];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">Model Health</h1>
          <p className="mt-1 text-neutral-500">Monitor the performance and reliability of the detection model.</p>
        </div>
        <div className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-semibold ${status.cls}`}>
          <StatusIcon size={16} /> {status.label}
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Cpu, label: 'Model Version', value: health.version, accent: 'bg-primary-50 text-primary-600' },
          { icon: Clock, label: 'Last Trained', value: new Date(health.lastTrained).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), accent: 'bg-accent-50 text-accent-600' },
          { icon: Gauge, label: 'Avg Latency', value: `${health.latency.value}ms`, accent: 'bg-success-50 text-success-600' },
          { icon: ShieldCheck, label: 'Uptime', value: `${health.uptime.value}%`, accent: 'bg-warning-50 text-warning-600' },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-base p-5"
          >
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${c.accent} mb-3`}>
              <c.icon size={20} />
            </div>
            <p className="text-xs text-neutral-500 font-medium">{c.label}</p>
            <p className="mt-1 text-xl font-bold text-neutral-800">{c.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Circular progress metrics */}
      <ChartCard title="Performance Metrics" subtitle="Real-time model performance against targets">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 py-4">
          {metrics.map((m, i) => {
            const cfg = metricStatusConfig[m.status];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center gap-3"
              >
                <CircularProgress {...m} />
                <div className="text-center">
                  <p className="text-sm font-semibold text-neutral-700">{m.name}</p>
                  <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-xs font-medium ${cfg.cls}`}>
                    <Icon size={11} /> {m.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ChartCard>

      {/* System info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Training History" subtitle="Recent model training events">
          <div className="space-y-3">
            {[
              { version: 'v2.4.1', date: 'Jul 18, 2026', accuracy: '94.2%', status: 'current' },
              { version: 'v2.4.0', date: 'Jul 04, 2026', accuracy: '93.8%', status: 'previous' },
              { version: 'v2.3.9', date: 'Jun 20, 2026', accuracy: '93.1%', status: 'previous' },
              { version: 'v2.3.8', date: 'Jun 06, 2026', accuracy: '92.4%', status: 'previous' },
            ].map((t) => (
              <div key={t.version} className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${t.status === 'current' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                    <Activity size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{t.version}</p>
                    <p className="text-xs text-neutral-500">{t.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-700">{t.accuracy}</p>
                  {t.status === 'current' && <span className="text-xs text-primary-600 font-medium">Active</span>}
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Resource Utilization" subtitle="Infrastructure health">
          <div className="space-y-4">
            {[
              { label: 'CPU Usage', value: 42, unit: '%', color: '#2563EB' },
              { label: 'Memory Usage', value: 68, unit: '%', color: '#F59E0B' },
              { label: 'GPU Utilization', value: 81, unit: '%', color: '#10B981' },
              { label: 'Storage', value: 35, unit: '%', color: '#8B5CF6' },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-neutral-700">{r.label}</span>
                  <span className="font-semibold text-neutral-800">{r.value}{r.unit}</span>
                </div>
                <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.value}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: r.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
