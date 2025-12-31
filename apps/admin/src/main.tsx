import './main.css';

import React from 'react';
import { getManagerRouter } from '@/router';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { showToast } from '@/components/custom/showToast';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: Error) => {
      showToast.error(sprintf(__('An error occurred: %s', 'yay-wholesale'), error.message));
    },
  }),
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

createRoot(document.getElementById('yay-wholesale') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={getManagerRouter()} />
    </QueryClientProvider>
  </React.StrictMode>,
);
