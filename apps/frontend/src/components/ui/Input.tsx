'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <div className="absolute left-3.5 text-gray-400 pointer-events-none">{icon}</div>}
        <input
          className={`w-full ${
            icon ? 'pl-10' : 'px-4'
          } py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/40 focus:bg-white/[0.05] transition-all ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-accent-rose font-medium">{error}</p>}
    </div>
  );
}
