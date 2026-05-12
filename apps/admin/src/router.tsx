import { createHashRouter, redirect } from 'react-router-dom';

import DashboardPage from '@/pages/dashboard/DashboardPage';
import RolesPage from '@/pages/roles/RolesPage';
import WholesalersPage from '@/pages/wholesalers/WholesalersPage';
import AppLayout from './AppLayout';
import NotFoundPage from './pages/404';
import ErrorPage from './pages/500';
import RequestsPage from './pages/requests/RequestsPage';
import SettingsPage from './pages/settings/SettingsPage';

export function getManagerRouter() {
  return createHashRouter([
    {
      path: '/',
      element: <AppLayout />,
      errorElement: <ErrorPage />,
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
          path: 'requests',
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
          path: 'wholesalers',
          element: <WholesalersPage />,
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
        {
          path: '*',
          element: <NotFoundPage />,
        },
      ],
    },
  ]);
}
