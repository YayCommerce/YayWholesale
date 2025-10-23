import { TabsContent } from '@radix-ui/react-tabs';
import { __ } from '@wordpress/i18n';

export default function RequestTab() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold">{__('Request')}</h1>
      <div className="mt-4 rounded-lg border p-4">
        <p className="text-gray-600">{__('Welcome to the Request tab!')}</p>
      </div>
    </div>
  );
}
