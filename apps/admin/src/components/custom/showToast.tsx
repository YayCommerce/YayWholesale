import { CheckCircleIcon, InfoIcon, WarningCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';

export const showToast = {
  success: (message: string) =>
    toast.success(message, {
      icon: <CheckCircleIcon size={20} color="#16a34a" weight="fill" />,
    }),

  error: (message: string) =>
    toast.error(message, {
      icon: <XCircleIcon size={20} color="#dc2626" weight="fill" />,
    }),

  warning: (message: string) =>
    toast(message, {
      icon: <WarningCircleIcon size={20} color="#eab308" weight="fill" />,
    }),

  info: (message: string) =>
    toast(message, {
      icon: <InfoIcon size={20} color="#2563eb" weight="fill" />,
    }),
};
