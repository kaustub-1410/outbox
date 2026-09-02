'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useSearchEmails(query: string, status?: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['search-emails', query, status, page, limit],
    queryFn: async () => {
      const res = await api.get(`/search?q=${encodeURIComponent(query)}${status ? `&status=${status}` : ''}&page=${page}&limit=${limit}`);
      return res.data.data;
    },
    enabled: true,
  });
}
