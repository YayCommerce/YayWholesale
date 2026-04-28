import './main.css';

import React from 'react';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { getManagerRouter } from '@/router';
import { handleErrorMessage } from './lib/utils';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleErrorMessage,
  }),
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

createRoot(document.getElementById('yay-wholesale-b2b') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={getManagerRouter()} />
    </QueryClientProvider>
  </React.StrictMode>,
);
