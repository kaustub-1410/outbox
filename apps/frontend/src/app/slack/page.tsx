'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import SlackConnectCard from '../../components/ui/SlackConnectCard';
import ComposeEmailModal from '../../components/ComposeEmailModal';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../lib/api';

export default function SlackPage() {
  const { fetchCurrentUser } = useAuthStore();
  const [slackData, setSlackData] = useState<{ isConnected: boolean; teamName?: string; connectedDate?: string } | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    const loadStatus = async () => {
      try {
        const res = await api.get('/slack/status');
        if (res.data.success) {
          setSlackData({
            isConnected: res.data.data.isConnected,
            teamName: res.data.data.connection?.teamName,
            connectedDate: res.data.data.connection?.createdAt
              ? new Date(res.data.data.connection.createdAt).toLocaleDateString()
              : undefined,
          });
        }
      } catch (err) {
        console.error('Slack status fetch error', err);
      }
    };
    loadStatus();
  }, [fetchCurrentUser]);

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar onOpenCompose={() => setIsComposeOpen(true)} />

      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <Header title="Slack Integration" />

        <main className="p-8 space-y-8 flex-1 max-w-4xl">
          <div>
            <h1 className="font-serif italic text-5xl font-normal text-white tracking-tight">
              Slack <span className="not-italic">Notifications</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Connect your Slack workspace to receive real-time web alerts when sender rate limits are triggered.
            </p>
          </div>

          <SlackConnectCard
            status={slackData?.isConnected ? 'CONNECTED' : 'NOT_CONNECTED'}
            teamName={slackData?.teamName}
            connectedDate={slackData?.connectedDate}
            onDisconnect={() => setSlackData({ isConnected: false })}
          />
        </main>
      </div>

      <ComposeEmailModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
    </div>
  );
}
