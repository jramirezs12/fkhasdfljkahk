// Cliente de React Query (TanStack) con defaults óptimos para GraphQL
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10_000, // 10s como fresco: navegación sin refetch inmediato
      gcTime: 5 * 60_000, // 5min antes de garbage collect en caché
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});
