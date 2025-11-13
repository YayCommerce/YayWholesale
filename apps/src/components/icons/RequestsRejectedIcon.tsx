import { cn } from '@/lib/utils';

export default function RequestsRejectedIcon({ className = '', ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      className={cn('text-destructive', className)}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" x2="9" y1="15" y2="9" />
    </svg>
  );
}
