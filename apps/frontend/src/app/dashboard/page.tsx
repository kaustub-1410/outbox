'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, CheckCircle2, AlertTriangle, ShieldAlert, Activity, Mail } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import MetricCard from '../../components/ui/MetricCard';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ComposeEmailModal from '../../components/ComposeEmailModal';
import { useMetrics } from '../../hooks/useMetrics';
import { useAuthStore } from '../../store/useAuthStore';
import Link from 'next/link';

export default function DashboardPage() {
  const { fetchCurrentUser } = useAuthStore();
  const { data: metrics, isLoading: isMetricsLoading, refetch } = useMetrics();
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <Sidebar onOpenCompose={() => setIsComposeOpen(true)} />

      {/* Main Content Layout */}
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <Header title="Dashboard" />

        <main className="p-8 space-y-10 flex-1">
          {/* Dashboard Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="liquid-glass rounded-[32px] p-10 border border-white/10 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl"
          >
            <div className="space-y-4 max-w-2xl">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/10">
                Enterprise Delivery System
              </span>
              <h1 className="font-serif italic text-6xl font-normal text-white leading-none tracking-tight">
                Email Scheduling <span className="not-italic">Platform</span>
              </h1>
              <p className="text-sm text-gray-400 leading-relaxed">
                Manage campaigns, schedule emails, monitor delivery and enforce distributed rate limits seamlessly.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsComposeOpen(true)}
              className="shrink-0 flex items-center gap-2"
            >
              <span>Compose Campaign</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>

          {/* KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <MetricCard
              title="Scheduled Emails"
              value={isMetricsLoading ? '...' : metrics?.scheduledCount ?? 0}
              icon={Clock}
              growth="+18%"
              subtitle="BullMQ delayed queue"
            />
            <MetricCard
              title="Sent Emails"
              value={isMetricsLoading ? '...' : metrics?.sentCount ?? 0}
              icon={CheckCircle2}
              growth="+24%"
              subtitle="Ethereal SMTP delivered"
            />
            <MetricCard
              title="Failed Emails"
              value={isMetricsLoading ? '...' : metrics?.failedCount ?? 0}
              icon={ShieldAlert}
              growth="0%"
              subtitle="Exceeded max retry limits"
            />
            <MetricCard
              title="Rate Limit Events"
              value={isMetricsLoading ? '...' : metrics?.rateLimitEventsCount ?? 0}
              icon={AlertTriangle}
              growth="+5%"
              subtitle="Auto rescheduled to next hour"
            />
          </div>

          {/* Recent Activity Table Card */}
          <Card hoverEffect={false} className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-white" />
                <h3 className="text-base font-bold text-white">Recent Activity Stream</h3>
              </div>
              <span className="text-xs text-gray-400">Live polled every 5s</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] text-gray-400 uppercase tracking-wider font-semibold border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Recipient & Message</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Scheduled / Event Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {!metrics?.recentActivity || metrics.recentActivity.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-10 text-center text-gray-500">
                        No recent activity recorded. Click 'Compose Campaign' to start.
                      </td>
                    </tr>
                  ) : (
                    metrics.recentActivity.map((act) => (
                      <tr key={act.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4 font-medium text-white flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{act.message}</span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge status={act.type} />
                        </td>
                        <td className="py-4 px-4 text-gray-400 font-mono">
                          {new Date(act.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>

      <ComposeEmailModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
