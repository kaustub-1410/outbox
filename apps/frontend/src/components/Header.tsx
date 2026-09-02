'use client';

import React from 'react';
import { Search, Bell, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
}

export default function Header({ title = 'Dashboard' }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="h-20 sticky top-0 z-30 w-full liquid-glass border-b border-white/10 px-8 flex items-center justify-between shadow-xl">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/search"
          className="px-3.5 py-2 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-gray-400 flex items-center gap-2 hover:border-white/20 transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <span className="hidden sm:inline">Search emails, recipients, subjects...</span>
          <kbd className="hidden md:inline px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-300 font-mono">
            ⌘K
          </kbd>
        </Link>

        <button className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all">
          <Bell className="w-4 h-4" />
        </button>

        {user && (
          <Link href="/settings" className="flex items-center gap-2 pl-2">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              alt={user.name}
              className="w-9 h-9 rounded-full ring-2 ring-white/20 object-cover"
            />
          </Link>
        )}
      </div>
    </header>
  );
}
