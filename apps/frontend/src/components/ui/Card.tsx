'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export default function Card({ children, className = '', hoverEffect = true, ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={hoverEffect ? { scale: 1.01, transition: { duration: 0.2 } } : undefined}
      className={`liquid-glass rounded-3xl p-6 border border-white/10 shadow-2xl ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
