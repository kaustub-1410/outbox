'use client';

import React, { useEffect, useState } from 'react';
import { Layers, Clock, Zap, CheckCircle2, ShieldAlert } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Card from '../../components/ui/Card';
import MetricCard from '../../components/ui/MetricCard';
import ComposeEmailModal from '../../components/ComposeEmailModal';
import { useAuthStore } from '../../store/useAuthStore';

export default function QueuesPage() {
  const { fetchCurrentUser } = useAuthStore();
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar onOpenCompose={() => setIsComposeOpen(true)} />

      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <Header title="BullMQ Queue Monitor" />

        <main className="p-8 space-y-8 flex-1">
          <div>
            <h1 className="font-serif italic text-5xl font-normal text-white tracking-tight">
              Queue <span className="not-italic">Statistics & Monitor</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Live Redis BullMQ queue monitoring dashboard embedded via Express server adapter.
            </p>
          </div>

          {/* Queue Statistics Header Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard title="Waiting" value="Active" icon={Clock} growth="Redis" subtitle="In queue" />
            <MetricCard title="Active" value="Worker" icon={Zap} growth="Parallel" subtitle="Processing" />
            <MetricCard title="Delayed" value="Delayed" icon={Clock} growth="Timestamp" subtitle="BullMQ" />
            <MetricCard title="Completed" value="Success" icon={CheckCircle2} growth="24h" subtitle="Delivered" />
            <MetricCard title="Failed" value="Retry" icon={ShieldAlert} growth="Backoff" subtitle="3 Attempts" />
          </div>

          {/* Bull Board Glass Wrapper Iframe */}
          <Card hoverEffect={false} className="p-0 overflow-hidden h-[700px] border border-white/10 shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white">Bull Board Dashboard (/admin/queues)</span>
              </div>
              <a
                href="http://localhost:5000/admin/queues"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-gray-400 hover:text-white underline"
              >
                Open in new tab ↗
              </a>
            </div>

            <iframe
              src="http://localhost:5000/admin/queues"
              className="w-full h-full border-0 bg-black/50"
              title="Bull Board Queue Monitor"
            />
          </Card>
        </main>
      </div>

      <ComposeEmailModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
    </div>
  );
}
