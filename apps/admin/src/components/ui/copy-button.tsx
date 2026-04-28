'use client';

import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import { type VariantProps } from 'class-variance-authority';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { AnimatePresence, HTMLMotionProps } from 'motion/react';
import * as m from 'motion/react-m';

import { cn } from '@/lib/utils';
import { buttonVariants } from './button';

type CopyButtonProps = Omit<HTMLMotionProps<'button'>, 'children' | 'onCopy'> &
  VariantProps<typeof buttonVariants> & {
    content?: string;
    delay?: number;
    onCopy?: (content: string) => void;
    isCopied?: boolean;
    onCopyChange?: (isCopied: boolean) => void;
  };
function CopyButton({
  content,
  className,
  size = 'icon',
  variant = 'outline',
  delay = 3000,
  onClick,
  onCopy,
  isCopied,
  onCopyChange,
  ...props
}: CopyButtonProps) {
  const [localIsCopied, setLocalIsCopied] = useState(isCopied ?? false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setLocalIsCopied(isCopied ?? false);
    setIsDirty(true);
  }, [isCopied]);
  const handleIsCopied = useCallback(
    (isCopied: boolean) => {
      setLocalIsCopied(isCopied);
      setIsDirty(true);
      onCopyChange?.(isCopied);
    },
    [onCopyChange],
  );
  const handleCopy = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (isCopied) return;
      if (content) {
        navigator.clipboard
          .writeText(content)
          .then(() => {
            handleIsCopied(true);
            setTimeout(() => handleIsCopied(false), delay);
            onCopy?.(content);
          })
          .catch((error) => {
            console.error('Error copying command', error);
          });
      }
      onClick?.(e);
    },
    [isCopied, content, delay, onClick, onCopy, handleIsCopied],
  );

  return (
    <m.button
      data-slot="copy-button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(buttonVariants({ variant, size }), className)}
      onClick={handleCopy}
      {...props}
    >
      <AnimatePresence mode="wait">
        <m.span
          key={localIsCopied ? 'check' : 'copy'}
          data-slot="copy-button-icon"
          initial={{ scale: isDirty ? 0 : 1 }} // prevent animation on first render
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.15 }}
        >
          {localIsCopied ? <CheckIcon /> : <CopyIcon />}
        </m.span>
      </AnimatePresence>
    </m.button>
  );
}

export { CopyButton, buttonVariants, type CopyButtonProps };
