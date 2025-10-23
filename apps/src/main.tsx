import './main.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { getManagerRouter } from './router';

createRoot(document.getElementById('yay-wholesale') as HTMLElement).render(
  <React.StrictMode>
    {/* <App /> */}
    <RouterProvider router={getManagerRouter()} />
  </React.StrictMode>,
);
