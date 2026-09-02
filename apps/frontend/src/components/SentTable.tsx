'use client';

import React from 'react';
import { CheckCircle2, ExternalLink, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmailJobDTO } from '@reachinbox/shared-types';

interface SentTableProps {
  jobs: EmailJobDTO[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  isLoading: boolean;
}

export default function SentTable({
  jobs,
  total,
  page,
  limit,
  onPageChange,
  isLoading,
}: SentTableProps) {
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="glass-card rounded-2xl border border-surface-border overflow-hidden shadow-xl">
      <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-card/30">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
          <h3 className="text-sm font-semibold text-white">Sent Emails ({total})</h3>
        </div>
        <span className="text-xs text-gray-400">Ethereal SMTP Delivery Logs</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-card/60 text-gray-400 uppercase tracking-wider font-semibold border-b border-surface-border">
            <tr>
              <th className="py-3 px-4">Recipient</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Sent Time</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Sender</th>
              <th className="py-3 px-4 text-right">Ethereal Preview</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/50 text-gray-300">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-accent-emerald border-t-transparent rounded-full animate-spin" />
                    <span>Loading sent delivery logs...</span>
                  </div>
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No sent emails recorded yet.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="hover:bg-surface-card/40 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{job.lead?.email || 'N/A'}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-200 max-w-xs truncate">{job.subject}</td>
                  <td className="py-3.5 px-4 text-gray-400 font-mono">
                    {job.sentAt ? new Date(job.sentAt).toLocaleString() : 'N/A'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20">
                      <CheckCircle2 className="w-3 h-3" />
                      DELIVERED
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-400">
                    {job.sender?.senderEmail || 'Default Sender'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {job.previewUrl ? (
                      <a
                        href={job.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-600/10 hover:bg-primary-600/20 text-primary-500 font-medium transition-colors border border-primary-500/20"
                      >
                        <span>View Preview</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-surface-border flex items-center justify-between text-xs text-gray-400">
        <span>
          Showing page {page} of {totalPages} ({total} items)
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="p-1.5 rounded-lg border border-surface-border hover:bg-surface-card disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="p-1.5 rounded-lg border border-surface-border hover:bg-surface-card disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
