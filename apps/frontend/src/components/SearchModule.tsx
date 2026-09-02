'use client';

import React, { useState } from 'react';
import { Search, Filter, Database, Zap, ExternalLink, Calendar } from 'lucide-react';
import Card from './ui/Card';
import Input from './ui/Input';
import Badge from './ui/Badge';
import Loader from './ui/Loader';
import EmptyState from './ui/EmptyState';
import { useSearchEmails } from '../hooks/useSearchEmails';

export default function SearchModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSearchEmails(searchTerm, statusFilter, page, 20);

  const searchSource = data?.source || 'elasticsearch';
  const total = data?.total || 0;
  const items = data?.items || [];

  return (
    <div className="space-y-6">
      {/* Search Header Bar */}
      <Card hoverEffect={false} className="p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search emails, recipients, subjects..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            icon={<Search className="w-4 h-4 text-gray-400" />}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-gray-300">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-black text-white">
                All Statuses
              </option>
              <option value="SCHEDULED" className="bg-black text-white">
                SCHEDULED
              </option>
              <option value="SENT" className="bg-black text-white">
                SENT
              </option>
              <option value="RATE_LIMITED" className="bg-black text-white">
                RATE LIMITED
              </option>
              <option value="FAILED" className="bg-black text-white">
                FAILED
              </option>
            </select>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-gray-400 flex items-center gap-2 whitespace-nowrap">
            <Database className="w-4 h-4 text-accent-cyan" />
            <span>Engine: </span>
            <span className="font-semibold text-accent-cyan capitalize">{searchSource}</span>
          </div>
        </div>
      </Card>

      {/* Live Results Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-semibold text-gray-300">Search Results ({total})</h3>
          <span className="text-xs text-gray-500">Indexed in Elasticsearch 8</span>
        </div>

        {isLoading ? (
          <Loader label="Querying Elasticsearch cluster..." />
        ) : items.length === 0 ? (
          <EmptyState
            title="No Matching Results"
            description="Try adjusting your search terms or filters to find emails."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item: any) => (
              <Card key={item.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{item.recipient}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Sender: {item.sender}</div>
                  </div>
                  <Badge status={item.status} />
                </div>

                <div className="text-xs text-gray-200 font-semibold truncate">{item.subject}</div>

                <div className="text-xs text-gray-400 line-clamp-2 leading-relaxed bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                  {item.body}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-gray-500">
                  <span>
                    {item.sentAt
                      ? `Sent: ${new Date(item.sentAt).toLocaleString()}`
                      : `Scheduled: ${new Date(item.scheduledAt).toLocaleString()}`}
                  </span>

                  {item.previewUrl && (
                    <a
                      href={item.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
