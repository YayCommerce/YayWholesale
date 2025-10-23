import './main.css';

import React from 'react';
import { getManagerRouter } from '@/router';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

createRoot(document.getElementById('yay-wholesale') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={getManagerRouter()} />
  </React.StrictMode>,
);
