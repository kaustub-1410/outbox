'use client';

import React from 'react';
import { ShieldCheck, Slack, Mail, Zap } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useAuthStore } from '../store/useAuthStore';

export default function SettingsModule() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Google Account */}
      <Card className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/20">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
              alt={user?.name || 'User'}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{user?.name || 'Authenticated User'}</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white border border-white/20">
                <ShieldCheck className="w-3 h-3" />
                Google Account Active
              </span>
            </div>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Slack Integration Section */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4A154B]/30 border border-[#4A154B]/50 flex items-center justify-center">
              <Slack className="w-5 h-5 text-[#ECB22E]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Slack Connected Service</h3>
              <p className="text-xs text-gray-400">Webhook and Web API rate limit notifications</p>
            </div>
          </div>
          <a href="/slack">
            <Button variant="glass" size="sm">
              Manage Integration
            </Button>
          </a>
        </div>
      </Card>

      {/* Sender Accounts & Rate Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Mail className="w-4 h-4 text-white" />
            <span>Sender Accounts</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Ethereal test accounts are generated automatically. Custom SMTP credentials can be registered per user sender account.
          </p>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 text-xs font-mono text-gray-300">
            Default: {user?.email} (Ethereal SMTP)
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Zap className="w-4 h-4 text-white" />
            <span>Hourly Limit Controls</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Redis rate limits are enforced atomically per sender hour (<code className="text-white">rate_limit:senderId:YYYYMMDDHH</code>).
          </p>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 text-xs font-mono text-gray-300">
            Cap: 200 emails / hour / sender
          </div>
        </Card>
      </div>
    </div>
  );
}
