import { __ } from '@wordpress/i18n';

import { Button } from './button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog';

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
      {__('You have unsaved changes. Do you want to save them before leaving?', 'yay-wholesale-b2b')}
    </DialogDescription>
  ),
}: UnsavedChangeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bw:max-w-md">
        <DialogHeader className="bw:border-b-0">
          <DialogTitle>{__('Unsaved Changes', 'yay-wholesale-b2b')}</DialogTitle>
          {children}
        </DialogHeader>

        <DialogFooter>
          <Button variant="ghost" onClick={onDiscard}>
            {__('Discard Changes', 'yay-wholesale-b2b')}
          </Button>
          <Button onClick={onSave}>{__('Save Changes', 'yay-wholesale-b2b')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
