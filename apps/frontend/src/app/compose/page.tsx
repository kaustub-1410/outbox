'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Send, AlertCircle, Clock, Zap, ArrowLeft } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import CSVUploader from '../../components/ui/CSVUploader';
import { api } from '../../lib/api';
import Link from 'next/link';

export default function ComposePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [startTime, setStartTime] = useState(
    new Date(Date.now() + 60000).toISOString().slice(0, 16)
  );
  const [delayBetweenEmails, setDelayBetweenEmails] = useState(2);
  const [hourlyLimit, setHourlyLimit] = useState(200);
  const [leads, setLeads] = useState<string[]>([]);
  const [manualText, setManualText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLeadsParsed = (parsedLeads: string[]) => {
    setLeads(parsedLeads);
    setManualText(parsedLeads.join('\n'));
  };

  const handleManualTextChange = (text: string) => {
    setManualText(text);
    const validEmails = text
      .split(/\r?\n/)
      .map((l) => l.trim().toLowerCase())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    setLeads(Array.from(new Set(validEmails)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (leads.length === 0) {
      setError('Please provide at least one valid lead email address.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name,
        subject,
        body,
        startTime: new Date(startTime).toISOString(),
        delayBetweenEmails: Number(delayBetweenEmails),
        hourlyLimit: Number(hourlyLimit),
        leads,
      };

      const res = await api.post('/campaigns', payload);
      if (res.data.success) {
        setLoading(false);
        router.push('/scheduled');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || err.message || 'Failed to schedule campaign');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />

      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <Header title="Compose Campaign" />

        <main className="p-8 space-y-8 flex-1 max-w-4xl">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <Card hoverEffect={false} className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h1 className="font-serif italic text-5xl font-normal text-white tracking-tight">
                Create <span className="not-italic">Campaign</span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Configure BullMQ delayed queue parameters and upload your target leads list.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-accent-rose/10 border border-accent-rose/30 text-accent-rose text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Campaign Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Q4 Executive Outreach"
                />
                <Input
                  label="Email Subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Quick introduction to ReachInbox"
                />
              </div>

              <Textarea
                label="Email Body Content"
                required
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Hi {{name}}, I wanted to reach out regarding..."
              />

              {/* Lead Dropzone */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Lead Recipients Upload (CSV / Plain Text)
                </label>
                <CSVUploader onLeadsParsed={handleLeadsParsed} />

                <Textarea
                  rows={3}
                  value={manualText}
                  onChange={(e) => handleManualTextChange(e.target.value)}
                  placeholder="Or paste email addresses here (one per line)..."
                />
              </div>

              {/* Queue Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <Input
                  label="Start Time"
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <Input
                  label="Delay Between Emails (sec)"
                  type="number"
                  min="0"
                  required
                  value={delayBetweenEmails}
                  onChange={(e) => setDelayBetweenEmails(Number(e.target.value))}
                />
                <Input
                  label="Hourly Limit (/hr)"
                  type="number"
                  min="1"
                  required
                  value={hourlyLimit}
                  onChange={(e) => setHourlyLimit(Number(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => router.push('/dashboard')}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Scheduling Queue...' : `Schedule Campaign (${leads.length} leads)`}
                </Button>
              </div>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
}
