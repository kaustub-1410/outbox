'use client';

import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import SearchModule from '../../components/SearchModule';
import ComposeEmailModal from '../../components/ComposeEmailModal';
import { useAuthStore } from '../../store/useAuthStore';

export default function SearchPage() {
  const { fetchCurrentUser } = useAuthStore();
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-gray-100">
      <Header />

      <div className="flex flex-1">
        <Sidebar onOpenCompose={() => setIsComposeOpen(true)} />

        <main className="flex-1 p-8 space-y-6 overflow-y-auto">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Elasticsearch Search</h1>
            <p className="text-sm text-gray-400">
              Query subject lines, email bodies, recipients, and senders indexed in Elasticsearch 8.
            </p>
          </div>

          <SearchModule />
        </main>
      </div>

      <ComposeEmailModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
    </div>
  );
}
