'use client';

import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/40 focus:bg-white/[0.05] transition-all resize-none ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-accent-rose font-medium">{error}</p>}
    </div>
  );
}
