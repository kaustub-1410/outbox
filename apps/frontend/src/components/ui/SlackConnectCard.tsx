'use client';

import React from 'react';
import { Slack, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import Card from './Card';
import Button from './Button';

interface SlackConnectCardProps {
  status: 'CONNECTED' | 'NOT_CONNECTED' | 'EXPIRED';
  teamName?: string;
  connectedDate?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export default function SlackConnectCard({
  status,
  teamName = 'Slack Workspace',
  connectedDate,
  onConnect,
  onDisconnect,
}: SlackConnectCardProps) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#4A154B]/30 border border-[#4A154B]/50 flex items-center justify-center">
            <Slack className="w-6 h-6 text-[#ECB22E]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Slack Web API Notifications</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Receive instant alerts when sender hourly limits are exceeded.
            </p>
          </div>
        </div>

        <div>
          {status === 'CONNECTED' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected
            </span>
          ) : status === 'EXPIRED' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
              <AlertTriangle className="w-3.5 h-3.5" />
              Token Expired
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-gray-400 border border-white/10">
              Not Connected
            </span>
          )}
        </div>
      </div>

      {status === 'CONNECTED' ? (
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">{teamName}</div>
            {connectedDate && <div className="text-xs text-gray-500">Connected on {connectedDate}</div>}
          </div>
          <Button variant="danger" size="sm" onClick={onDisconnect}>
            Disconnect Workspace
          </Button>
        </div>
      ) : (
        <a href="http://localhost:5000/api/slack/connect">
          <Button variant="primary" size="md" className="w-full flex items-center justify-center gap-2">
            <Slack className="w-4 h-4 text-black" />
            <span>Connect Slack Workspace</span>
            <ExternalLink className="w-3.5 h-3.5 text-black" />
          </Button>
        </a>
      )}
    </Card>
  );
}
