import { useState } from 'react';
import { DialogClose } from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router';
import { __ } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import {
  useCacheRequest,
  useDeleteRequestMutation,
  useIsMutatingRequest,
  useIsMutatingRequestsBulk,
} from '@/lib/queries/requests.queries';
import { Request } from '@/lib/schema/requests.type';
import { Button, LoadingButton } from '@/components/ui/button';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import DeleteIcon from '@/components/icons/DeleteIcon';
import SettingsIcon from '@/components/icons/SettingsIcon';

export function RequestActionCell({ request }: { request: Request }) {
  const navigate = useNavigate();
  const { cacheRequest } = useCacheRequest();
  const [openDialog, setOpenDialog] = useState(false);

  const deleteRequestMutation = useDeleteRequestMutation(request.id);
  const isMutatingRequest = useIsMutatingRequest(request.id);
  const isMutatingRequestsBulk = useIsMutatingRequestsBulk();

  async function onDeleteRequest() {
    if (isMutatingRequest || isMutatingRequestsBulk) return;
    try {
      await deleteRequestMutation.mutateAsync();
      setOpenDialog(false);
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  }

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <div className="flex w-10 items-center justify-end gap-2">
        <div className="peer flex gap-1.5 opacity-0 group-hover:opacity-100 has-data-[state='delayed-open']:opacity-100 has-data-[state='instant-open']:opacity-100">
          <WholeSaleToolTip
            trigger={
              <Button
                size="icon"
                variant="ghost"
                className="hover:text-primary text-muted-foreground size-8 hover:bg-white hover:shadow-xs"
                onClick={() => {
                  cacheRequest(request);
                  navigate(`/request/edit/${request.id}`);
                }}
              >
                <SettingsIcon className="size-4" />
              </Button>
            }
            content={<span>{__('See details', 'yay-wholesale-b2b')}</span>}
          />

          <WholeSaleToolTip
            trigger={
              <Button
                size="icon"
                variant="ghost"
                className="hover:text-destructive text-muted-foreground m-0 size-8 hover:bg-white hover:shadow-xs"
                onClick={() => setOpenDialog(true)}
              >
                <DeleteIcon className="size-4" />
              </Button>
            }
            content={<span>{__('Delete request', 'yay-wholesale-b2b')}</span>}
          />
        </div>
      </div>
      <DialogContent className="bw:max-w-md">
        <DialogHeader className="bw:border-b-0">
          <DialogTitle>{__('Are you sure you want to delete this request?', 'yay-wholesale-b2b')}</DialogTitle>
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
          <LoadingButton
            variant="destructive"
            loading={deleteRequestMutation.isPending}
            onClick={() => onDeleteRequest}
          >
            {__('Continue', 'yay-wholesale-b2b')}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
