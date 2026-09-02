'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { DashboardMetricsDTO } from '@reachinbox/shared-types';

export function useMetrics() {
  return useQuery<DashboardMetricsDTO>({
    queryKey: ['metrics'],
    queryFn: async () => {
      const res = await api.get('/emails/metrics');
      return res.data.data;
    },
    refetchInterval: 5000, // Live poll metrics every 5s for active dashboard updates
  });
}
