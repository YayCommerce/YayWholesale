import { Toaster as Sonner, toast, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-center"
      theme="system"
      className="toaster group"
      toastOptions={{
        className: 'p-2.5! justify-center',
      }}
      style={
        {
          '--width': 'max-content',
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius-md)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster, toast };
