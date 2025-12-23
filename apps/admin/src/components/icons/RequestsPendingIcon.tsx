import { cn } from '@/lib/utils';

export default function RequestsPendingIcon({ className = '', ...props }) {
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
      className={cn('text-[#A0A0A7]', className)}
      {...props}
    >
      <path d="M12 6v6l4 2" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
