import { createHashRouter, redirect } from 'react-router-dom';

import DashboardPage from '@/components/pages/dashboard/DashboardPage';
import RolesPage from '@/components/pages/roles/RolesPage';

import AppLayout from './AppLayout';
import NotFoundPage from './components/pages/404';
import RequestsPage from './components/pages/request/RequestsPage';
import SettingsPage from './components/pages/settings/SettingsPage';

export function getManagerRouter() {
  return createHashRouter([
    {
      path: '/',
      element: <AppLayout />,
      errorElement: <NotFoundPage />,
      children: [
        {
          index: true,
          loader: () => redirect('/dashboard'),
        },
        {
          path: 'dashboard',
          element: <DashboardPage />,
        },
        {
          path: 'request',
          children: [
            {
              index: true,
              element: <RequestsPage />,
            },
            {
              path: 'edit/:requestId',
              element: <RequestsPage />,
            },
          ],
        },
        {
          path: 'roles',
          children: [
            {
              index: true,
              element: <RolesPage />,
            },
            {
              path: 'new',
              element: <RolesPage />,
            },
            {
              path: 'edit/:roleId',
              element: <RolesPage />,
            },
          ],
        },
        {
          path: 'settings',
          children: [
            {
              index: true,
              loader: () => redirect('/settings/general'),
            },
            {
              path: ':subMenu',
              element: <SettingsPage />,
            },
          ],
        },
      ],
    },
  ]);
}
