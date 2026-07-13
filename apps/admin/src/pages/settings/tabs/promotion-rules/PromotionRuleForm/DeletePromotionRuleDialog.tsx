import { __ } from '@wordpress/i18n';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeletePromotionRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export function DeletePromotionRuleDialog({ open, onOpenChange, onConfirmDelete }: DeletePromotionRuleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bw:max-w-md">
        <DialogHeader className="bw:border-b-0">
          <DialogTitle>{__('Are you sure you want to delete this promotion rule?', 'yay-wholesale-b2b')}</DialogTitle>
          <DialogDescription>
            {__('This action cannot be undone. This promotion rule will be permanently removed.', 'yay-wholesale-b2b')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{__('Cancel', 'yay-wholesale-b2b')}</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirmDelete}>
            {__('Delete', 'yay-wholesale-b2b')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
