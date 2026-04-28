import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h1 className="text-primary mb-2 text-8xl font-bold">404</h1>
        <h2 className="text-primary mb-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="text-primary">
          {__("The page you are looking for doesn't exist or has been moved.", 'yay-wholesale-b2b')}
        </p>
      </div>

      <button
        onClick={() => navigate('/dashboard')}
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-4 py-2 text-sm font-medium transition-colors"
      >
        {__('Back to Dashboard', 'yay-wholesale-b2b')}
      </button>
    </div>
  );
}
