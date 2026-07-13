import { createHashRouter, redirect } from 'react-router';

import DashboardPage from '@/pages/dashboard/DashboardPage';
import RolesPage from '@/pages/roles/RolesPage';
import { SetupWizardPage } from '@/pages/setup-wizard/SetupWizardPage';
import WholesalersPage from '@/pages/wholesalers/WholesalersPage';
import AppLayout from './AppLayout';
import NotFoundPage from './pages/404';
import ErrorPage from './pages/500';
import RequestsPage from './pages/requests/RequestsPage';
import SettingsPage from './pages/settings/SettingsPage';

export function getManagerRouter() {
  return createHashRouter([
    {
      path: '/setup-wizard',
      element: <SetupWizardPage />,
      errorElement: <ErrorPage />,
    },
    {
      path: '/',
      element: <AppLayout />,
      errorElement: <ErrorPage />,
      loader: async () => {
        if (window.yayWholesaleB2BAdmin.setup_wizard.status === 'fresh') {
          return redirect('/setup-wizard');
        }
      },
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
              path: 'edit/:roleSlug',
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
              loader: ({ params }) => {
                if (!params.subMenu || !settingSubMenus.includes(params.subMenu)) {
                  return redirect('/settings/general');
                }
              },
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

const settingSubMenus = [
  'general',
  'display',
  'registration',
  'registration-fields',
  'promotion-rules',
  'emails',
  'payment-roles',
  'shipping-roles',
];
