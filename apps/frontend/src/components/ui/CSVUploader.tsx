'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

interface CSVUploaderProps {
  onLeadsParsed: (leads: string[]) => void;
}

export default function CSVUploader({ onLeadsParsed }: CSVUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [stats, setStats] = useState<{ total: number; unique: number } | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      try {
        const res = await api.post('/campaigns/upload', { fileContent: content });
        if (res.data.success) {
          const { leads, parsedCount, uniqueCount } = res.data.data;
          setStats({ total: parsedCount, unique: uniqueCount });
          onLeadsParsed(leads);
        }
      } catch (err: any) {
        setError('File parsing error: ' + (err.response?.data?.error || err.message));
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <label
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`liquid-glass cursor-pointer rounded-2xl p-6 border-2 border-dashed flex flex-col items-center justify-center text-center transition-all ${
          dragActive ? 'border-white bg-white/[0.06]' : 'border-white/10 hover:border-white/30'
        }`}
      >
        <Upload className="w-8 h-8 text-gray-400 mb-2" />
        <span className="text-sm font-semibold text-white">Drag & drop your CSV or TXT lead file</span>
        <span className="text-xs text-gray-400 mt-1">Automatic email validation & deduplication</span>
        <input
          type="file"
          accept=".csv,.txt"
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
          className="hidden"
        />
      </label>

      {error && (
        <div className="p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/30 text-accent-rose text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {stats && (
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-300">
            <FileText className="w-4 h-4 text-white" />
            <span className="font-semibold text-white">{fileName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-accent-emerald font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>{stats.unique} unique leads verified</span>
          </div>
        </div>
      )}
    </div>
  );
}
