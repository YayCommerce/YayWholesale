import { TabsContent } from '@radix-ui/react-tabs';
import { __ } from '@wordpress/i18n';

export default function DashboardTab() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold">{__('Dashboard')}</h1>
      <div className="mt-4 rounded-lg border p-4">
        <p className="text-gray-600">
          {__(
            'Welcome to the dashboard! This is where you can manage your wholesale settings and view important metrics.',
          )}
        </p>
      </div>
    </div>
  );
}
