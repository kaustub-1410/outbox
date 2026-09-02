'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  growth?: string;
  subtitle?: string;
}

export default function MetricCard({ title, value, icon: Icon, growth = '+12%', subtitle }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="liquid-glass rounded-3xl p-6 border border-white/10 relative overflow-hidden shadow-2xl group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white group-hover:border-white/30 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-4xl font-extrabold text-white tracking-tight">{value}</div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-accent-emerald bg-accent-emerald/10 px-2.5 py-0.5 rounded-full border border-accent-emerald/20">
          <TrendingUp className="w-3 h-3" />
          <span>{growth}</span>
        </div>
      </div>

      {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
    </motion.div>
  );
}
