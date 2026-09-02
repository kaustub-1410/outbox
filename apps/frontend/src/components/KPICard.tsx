'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan';
  subtitle?: string;
}

const colorStyles = {
  indigo: {
    iconBg: 'bg-primary-500/10 text-primary-500 border-primary-500/20',
    accentLine: 'from-primary-500',
  },
  emerald: {
    iconBg: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20',
    accentLine: 'from-accent-emerald',
  },
  amber: {
    iconBg: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
    accentLine: 'from-accent-amber',
  },
  rose: {
    iconBg: 'bg-accent-rose/10 text-accent-rose border-accent-rose/20',
    accentLine: 'from-accent-rose',
  },
  cyan: {
    iconBg: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20',
    accentLine: 'from-accent-cyan',
  },
};

export default function KPICard({ title, value, icon: Icon, color, subtitle }: KPICardProps) {
  const style = colorStyles[color];

  return (
    <div className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-surface-border/80 transition-all duration-300 shadow-lg">
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${style.accentLine} to-transparent opacity-75`} />
      
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>

        <div className={`p-3 rounded-xl border ${style.iconBg} shadow-inner`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
