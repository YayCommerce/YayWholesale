import { useState } from 'react';
import { PencilLine } from 'lucide-react';
import { useNavigate } from 'react-router';
import { __ } from '@wordpress/i18n';

import { useDeleteRoleMutation } from '@/lib/queries/roles.queries';
import { Role } from '@/lib/schema/roles.schema';
import { Button } from '@/components/ui/button';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DeleteIcon from '@/components/icons/DeleteIcon';
import { isDefaultRole } from '../roles.helper';

export function RoleActionCell({ role }: { role: Role }) {
  const { mutate: deleteRole, isPending: isDeletingRolePending } = useDeleteRoleMutation(role.slug);
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <div className="flex w-10 items-center justify-end gap-2">
        <div className="peer flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 has-data-[state='delayed-open']:opacity-100 has-data-[state='instant-open']:opacity-100">
          <WholeSaleToolTip
            trigger={
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  navigate(`/roles/edit/${role.slug}`);
                }}
                className="hover:text-primary text-muted-foreground transition hover:bg-white hover:shadow-xs"
              >
                <PencilLine className="size-4" />
              </Button>
            }
            content={<span>{__('Edit role', 'yay-wholesale-b2b')}</span>}
          />

          <WholeSaleToolTip
            trigger={
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDialog(true);
                }}
                disabled={isDeletingRolePending || isDefaultRole(role)}
                className="hover:text-destructive text-muted-foreground hover:bg-white hover:shadow-xs"
              >
                <DeleteIcon className="size-4" />
              </Button>
            }
            content={<span>{__('Delete role', 'yay-wholesale-b2b')}</span>}
          />
        </div>
      </div>
      <DialogContent className="bw:max-w-md">
        <DialogHeader className="bw:border-b-0">
          <DialogTitle>{__('Are you sure you want to delete this role?', 'yay-wholesale-b2b')}</DialogTitle>
          <DialogDescription>
            {__(
              'This action cannot be undone. This will permanently delete this request and remove data from servers',
              'yay-wholesale-b2b',
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{__('Cancel', 'yay-wholesale-b2b')}</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={() => {
              deleteRole();
              setOpenDialog(false);
            }}
          >
            {__('Continue', 'yay-wholesale-b2b')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
