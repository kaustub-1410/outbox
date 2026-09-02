'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useScheduledEmails(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['scheduled-emails', page, limit],
    queryFn: async () => {
      const res = await api.get(`/emails/scheduled?page=${page}&limit=${limit}`);
      return res.data.data;
    },
    refetchInterval: 3000,
  });
}

export function useSentEmails(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['sent-emails', page, limit],
    queryFn: async () => {
      const res = await api.get(`/emails/sent?page=${page}&limit=${limit}`);
      return res.data.data;
    },
    refetchInterval: 5000,
  });
}
