'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  variant?: 'primary' | 'glass' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Button({
  children,
  variant = 'glass',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl',
    md: 'px-5 py-2.5 text-sm rounded-2xl',
    lg: 'px-7 py-3.5 text-base rounded-2xl font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-white text-black font-semibold hover:bg-gray-100 shadow-xl shadow-white/10',
    glass:
      'liquid-glass text-white border border-white/20 hover:border-white/40 shadow-xl hover:bg-white/5',
    danger:
      'bg-accent-rose/15 text-accent-rose border border-accent-rose/30 hover:bg-accent-rose/25',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
