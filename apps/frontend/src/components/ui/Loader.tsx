'use client';

import React from 'react';

export default function Loader({ label = 'Loading data...' }: { label?: string }) {
  return (
    <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      <span className="text-xs text-gray-400 font-medium tracking-wide">{label}</span>
    </div>
  );
}
