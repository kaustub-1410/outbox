'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  Search,
  Settings,
  Layers,
  Plus,
  Slack,
  LogOut,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface SidebarProps {
  onOpenCompose?: () => void;
}

export default function Sidebar({ onOpenCompose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Scheduled Emails', href: '/scheduled', icon: Clock },
    { name: 'Sent Emails', href: '/sent', icon: CheckCircle2 },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Compose Campaign', href: '/compose', icon: Plus },
    { name: 'Slack Integration', href: '/slack', icon: Slack },
    { name: 'BullMQ Queues', href: '/queues', icon: Layers },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-72 liquid-glass border-r border-white/10 min-h-screen p-5 flex flex-col justify-between fixed top-0 left-0 bottom-0 z-40">
      <div className="space-y-6">
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center font-bold shadow-xl">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-lg text-white tracking-tight">ReachInbox</div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              Liquid Engine
            </p>
          </div>
        </div>

        {/* Action Button */}
        {onOpenCompose ? (
          <button
            onClick={onOpenCompose}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-gray-100 text-black font-semibold text-sm shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Compose Campaign</span>
          </button>
        ) : (
          <Link
            href="/compose"
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-gray-100 text-black font-semibold text-sm shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Compose Campaign</span>
          </Link>
        )}

        {/* Navigation List */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-inner'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      {user && (
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              alt={user.name}
              className="w-9 h-9 rounded-full ring-2 ring-white/20 object-cover shrink-0"
            />
            <div className="truncate text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-white truncate">{user.name}</span>
                <ShieldCheck className="w-3 h-3 text-accent-cyan shrink-0" />
              </div>
              <span className="text-[11px] text-gray-400 block truncate">{user.email}</span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Logout"
            className="p-1.5 rounded-xl text-gray-400 hover:text-accent-rose hover:bg-accent-rose/10 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
