'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import SettingsModule from '../../components/SettingsModule';
import ComposeEmailModal from '../../components/ComposeEmailModal';
import { useAuthStore } from '../../store/useAuthStore';

export default function SettingsPage() {
  const { fetchCurrentUser } = useAuthStore();
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar onOpenCompose={() => setIsComposeOpen(true)} />

      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <Header title="Settings" />

        <main className="p-8 space-y-8 flex-1 max-w-4xl">
          <div>
            <h1 className="font-serif italic text-5xl font-normal text-white tracking-tight">
              Platform <span className="not-italic">Settings</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage your Google account profile, Slack webhooks, sender accounts, and rate limit caps.
            </p>
          </div>

          <SettingsModule />
        </main>
      </div>

      <ComposeEmailModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
    </div>
  );
}
