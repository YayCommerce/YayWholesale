import './main.css';

import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

createRoot(document.getElementById('yay-wholesale') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
