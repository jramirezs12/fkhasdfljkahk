'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from './theme-provider';

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,               // Un reintento es suficiente (evita loops ante errores parciales)
        staleTime: 10_000,      // 10s “fresco” para navegación fluida sin refetch inmediato
        gcTime: 5 * 60_000,     // 5 minutos en caché tras quedar inactivo
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });

export function Providers({ children }) {
  // Asegura una única instancia por montaje en el cliente
  const [queryClient] = React.useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  );
}

export default Providers;
