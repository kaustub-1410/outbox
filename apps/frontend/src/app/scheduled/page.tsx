'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Search, Filter, Calendar, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import ComposeEmailModal from '../../components/ComposeEmailModal';
import { useScheduledEmails } from '../../hooks/useEmails';
import { useAuthStore } from '../../store/useAuthStore';
import { EmailJobDTO } from '@reachinbox/shared-types';

export default function ScheduledPage() {
  const { fetchCurrentUser } = useAuthStore();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const { data, isLoading, refetch } = useScheduledEmails(page, 20);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const rawItems: EmailJobDTO[] = data?.items || [];

  // Filter client side
  const filteredJobs = rawItems.filter((job) => {
    const matchesSearch =
      !searchTerm ||
      job.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.lead?.email && job.lead.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = !statusFilter || job.status === statusFilter;

    const matchesDate =
      !dateFilter ||
      new Date(job.scheduledAt).toISOString().slice(0, 10) === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil((data?.total || 0) / 20) || 1;

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar onOpenCompose={() => setIsComposeOpen(true)} />

      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <Header title="Scheduled Emails" />

        <main className="p-8 space-y-6 flex-1">
          {/* Glass Toolbar */}
          <Card hoverEffect={false} className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full max-w-md">
              <Input
                placeholder="Search scheduled subject or recipient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4 text-gray-400" />}
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-gray-300">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-black text-white">
                    All Statuses
                  </option>
                  <option value="SCHEDULED" className="bg-black text-white">
                    SCHEDULED
                  </option>
                  <option value="RATE_LIMITED" className="bg-black text-white">
                    RATE LIMITED
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-gray-300">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
                />
              </div>

              <Button variant="primary" size="sm" onClick={() => setIsComposeOpen(true)}>
                Schedule Email
              </Button>
            </div>
          </Card>

          {/* Jobs Table */}
          <Card hoverEffect={false} className="p-0 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-white" />
                <h3 className="text-base font-bold text-white">Queue Deliveries ({filteredJobs.length})</h3>
              </div>
              <span className="text-xs text-gray-400">BullMQ Redis Queue</span>
            </div>

            {isLoading ? (
              <Loader label="Loading scheduled BullMQ jobs..." />
            ) : filteredJobs.length === 0 ? (
              <EmptyState
                title="No Scheduled Emails"
                description="No email jobs match your search filters or queue is currently empty."
                actionText="Compose New Campaign"
                onAction={() => setIsComposeOpen(true)}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] text-gray-400 uppercase tracking-wider font-semibold border-b border-white/10">
                    <tr>
                      <th className="py-4 px-6">Recipient</th>
                      <th className="py-4 px-6">Subject</th>
                      <th className="py-4 px-6">Scheduled Time</th>
                      <th className="py-4 px-6">Sender</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {filteredJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6 font-semibold text-white flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{job.lead?.email || 'N/A'}</span>
                        </td>
                        <td className="py-4 px-6 text-gray-200 max-w-xs truncate">{job.subject}</td>
                        <td className="py-4 px-6 text-gray-400 font-mono">
                          {new Date(job.scheduledAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-gray-400">
                          {job.sender?.senderEmail || 'Default Sender'}
                        </td>
                        <td className="py-4 px-6">
                          <Badge status={job.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span>
                Page {page} of {totalPages} ({data?.total || 0} items)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="glass"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
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
