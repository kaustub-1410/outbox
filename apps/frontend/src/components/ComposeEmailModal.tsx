'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle } from 'lucide-react';
import Card from './ui/Card';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import CSVUploader from './ui/CSVUploader';
import { api } from '../lib/api';

interface ComposeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ComposeEmailModal({ isOpen, onClose, onSuccess }: ComposeEmailModalProps) {
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

  if (!isOpen) return null;

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
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || err.message || 'Failed to schedule campaign');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl"
        >
          <Card hoverEffect={false} className="p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="font-serif italic text-4xl font-normal text-white tracking-tight">
                  Create <span className="not-italic">Campaign</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">BullMQ delayed queue scheduling</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-accent-rose/10 border border-accent-rose/30 text-accent-rose text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="e.g. Intro to ReachInbox"
                />
              </div>

              <Textarea
                label="Email Body Content"
                required
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Hi {{name}}, I noticed your recent announcement..."
              />

              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Upload Leads File
                </label>
                <CSVUploader onLeadsParsed={handleLeadsParsed} />

                <Textarea
                  rows={2}
                  value={manualText}
                  onChange={(e) => handleManualTextChange(e.target.value)}
                  placeholder="Or paste email addresses here..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-white/10">
                <Input
                  label="Start Time"
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <Input
                  label="Delay (sec)"
                  type="number"
                  min="0"
                  required
                  value={delayBetweenEmails}
                  onChange={(e) => setDelayBetweenEmails(Number(e.target.value))}
                />
                <Input
                  label="Hourly Limit"
                  type="number"
                  min="1"
                  required
                  value={hourlyLimit}
                  onChange={(e) => setHourlyLimit(Number(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Scheduling...' : `Schedule (${leads.length} leads)`}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
