'use client';

import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface BadgeProps {
  status: 'SCHEDULED' | 'SENT' | 'FAILED' | 'RATE_LIMITED' | 'DELAYED' | string;
  className?: string;
}

export default function Badge({ status, className = '' }: BadgeProps) {
  const normalized = status.toUpperCase();

  if (normalized === 'SENT') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5" />
        SENT
      </span>
    );
  }

  if (normalized === 'RATE_LIMITED' || normalized === 'DELAYED') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-amber/10 text-accent-amber border border-accent-amber/20 ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5" />
        {normalized === 'RATE_LIMITED' ? 'RATE LIMITED' : 'DELAYED'}
      </span>
    );
  }

  if (normalized === 'FAILED') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-rose/10 text-accent-rose border border-accent-rose/20 ${className}`}>
        <ShieldAlert className="w-3.5 h-3.5" />
        FAILED
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 ${className}`}>
      <Clock className="w-3.5 h-3.5" />
      SCHEDULED
    </span>
  );
}
