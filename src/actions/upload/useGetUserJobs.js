'use client';

import { useQuery } from '@tanstack/react-query';

import { useUploadStore } from 'src/store/uploadStore';

import getUserJobs from './getUserJobs';

/**
 * useGetUserJobs - react-query wrapper around getUserJobs
 * - caches jobs and writes them to upload store for UI consumption
 */
export function useGetUserJobs({ enabled = true } = {}) {
  const setJobs = useUploadStore((s) => s.setJobs);

  return useQuery({
    queryKey: ['upload', 'userJobs'],
    queryFn: async () => {
      const res = await getUserJobs();
      if (!res.ok) throw new Error(res.message || 'Error fetching jobs');
      return res.data;
    },
    onSuccess: (data) => {
      if (Array.isArray(data)) setJobs(data);
      else if (Array.isArray(data.jobs)) setJobs(data.jobs);
    },
    enabled,
    staleTime: 1000 * 60 * 1,
    refetchInterval: false,
  });
}
export default useGetUserJobs;
