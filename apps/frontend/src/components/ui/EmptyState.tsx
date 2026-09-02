'use client';

import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title = 'No Data Found',
  description = 'There are no items recorded in this section yet.',
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="liquid-glass rounded-3xl p-12 border border-white/10 text-center flex flex-col items-center justify-center space-y-4 my-6">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
        <Inbox className="w-8 h-8 text-gray-400" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-sm text-gray-400 max-w-sm mt-1 mx-auto">{description}</p>
      </div>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
