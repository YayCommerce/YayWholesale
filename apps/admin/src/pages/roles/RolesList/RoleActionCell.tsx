import { useState } from 'react';
import { PencilLine } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { __ } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import { useDeleteRoleMutation, useIsMutatingRole, useIsMutatingRolesBulk } from '@/lib/queries/roles.queries';
import { Role } from '@/lib/schema/roles.schema';
import { Button, LoadingButton } from '@/components/ui/button';
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
  const deleteRoleMutation = useDeleteRoleMutation(role.slug);
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const isMutatingRole = useIsMutatingRole(role.slug);
  const isMutatingRolesBulk = useIsMutatingRolesBulk();

  async function onRoleDelete() {
    if (isMutatingRole || isMutatingRolesBulk) return;
    try {
      await deleteRoleMutation.mutateAsync();
      setOpenDialog(false);
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  }

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
              <LoadingButton
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  if (deleteRoleMutation.isPending) return;
                  setOpenDialog(true);
                }}
                disabled={isDefaultRole(role)}
                loading={deleteRoleMutation.isPending}
                className="hover:text-destructive text-muted-foreground hover:bg-white hover:shadow-xs"
              >
                <DeleteIcon className="size-4" />
              </LoadingButton>
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
          <LoadingButton variant="destructive" loading={deleteRoleMutation.isPending} onClick={onRoleDelete}>
            {__('Continue', 'yay-wholesale-b2b')}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
