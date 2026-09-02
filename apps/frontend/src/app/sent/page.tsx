'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, Mail, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import ComposeEmailModal from '../../components/ComposeEmailModal';
import { useSentEmails } from '../../hooks/useEmails';
import { useAuthStore } from '../../store/useAuthStore';
import { EmailJobDTO } from '@reachinbox/shared-types';

export default function SentPage() {
  const { fetchCurrentUser } = useAuthStore();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const { data, isLoading } = useSentEmails(page, 20);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const rawJobs: EmailJobDTO[] = data?.items || [];
  const filteredJobs = rawJobs.filter(
    (job) =>
      !searchTerm ||
      job.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.lead?.email && job.lead.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil((data?.total || 0) / 20) || 1;

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar onOpenCompose={() => setIsComposeOpen(true)} />

      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <Header title="Sent Emails Log" />

        <main className="p-8 space-y-6 flex-1">
          {/* Glass Toolbar */}
          <Card hoverEffect={false} className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search sent recipient or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4 text-gray-400" />}
              />
            </div>
          </Card>

          {/* Table Card */}
          <Card hoverEffect={false} className="p-0 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent-emerald" />
                <h3 className="text-base font-bold text-white">Delivered Email Logs ({filteredJobs.length})</h3>
              </div>
              <span className="text-xs text-gray-400">Ethereal SMTP Engine</span>
            </div>

            {isLoading ? (
              <Loader label="Loading sent email delivery logs..." />
            ) : filteredJobs.length === 0 ? (
              <EmptyState
                title="No Sent Emails Found"
                description="No delivered email records match your criteria."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] text-gray-400 uppercase tracking-wider font-semibold border-b border-white/10">
                    <tr>
                      <th className="py-4 px-6">Recipient</th>
                      <th className="py-4 px-6">Subject</th>
                      <th className="py-4 px-6">Sent Time</th>
                      <th className="py-4 px-6">Sender</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Ethereal Preview</th>
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
                          {job.sentAt ? new Date(job.sentAt).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-gray-400">
                          {job.sender?.senderEmail || 'Default Sender'}
                        </td>
                        <td className="py-4 px-6">
                          <Badge status={job.status} />
                        </td>
                        <td className="py-4 px-6 text-right">
                          {job.previewUrl ? (
                            <a href={job.previewUrl} target="_blank" rel="noreferrer">
                              <Button variant="glass" size="sm" className="gap-1 text-xs">
                                <span>View Email</span>
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </a>
                          ) : (
                            <span className="text-gray-500">Delivered</span>
                          )}
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
      />
    </div>
  );
}
