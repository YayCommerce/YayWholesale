import { __ } from '@wordpress/i18n';

import { Button } from './button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from './dialog';

interface UnsavedChangeDialogProps {
  open: boolean;
  onDiscard: () => void;
  onSave: () => void;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export function UnsavedChangeDialog({
  open,
  onDiscard,
  onSave,
  onOpenChange,
  children = (
    <DialogDescription>
      {__('You have unsaved changes. Do you want to save them before leaving?', 'bookster')}
    </DialogDescription>
  ),
}: UnsavedChangeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogClose>
          <DialogOverlay />
        </DialogClose>
        <DialogContent className="bw:max-w-md">
          <DialogHeader className="bw:border-b-0">
            <DialogTitle>{__('Unsaved Changes', 'bookster')}</DialogTitle>
            {children}
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={onDiscard}>
              {__('Discard Changes', 'bookster')}
            </Button>
            <Button onClick={onSave}>{__('Save Changes', 'bookster')}</Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
