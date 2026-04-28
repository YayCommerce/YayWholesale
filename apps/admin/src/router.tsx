import { createHashRouter, redirect } from 'react-router-dom';

import DashboardPage from '@/pages/dashboard/DashboardPage';
import RolesPage from '@/pages/roles/RolesPage';
import WholesalersListPage from '@/pages/wholesalers-list/WholeSalersListPage';

import AppLayout from './AppLayout';
import NotFoundPage from './pages/404';
import RequestsPage from './pages/request/RequestsPage';
import SettingsPage from './pages/settings/SettingsPage';

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
          path: 'wholesalers-list',
          children: [
            {
              index: true,
              element: <WholesalersListPage />,
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
