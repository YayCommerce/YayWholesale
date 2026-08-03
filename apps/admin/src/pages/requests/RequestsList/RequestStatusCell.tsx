import { ChevronDown, Loader2 } from 'lucide-react';
import { __, sprintf } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import {
  useApproveRequestMutation,
  useIsMutatingRequest,
  useIsMutatingRequestsBulk,
  useRejectRequestMutation,
} from '@/lib/queries/requests.queries';
import { useActiveRolesQuery, useDefaultRole } from '@/lib/queries/roles.queries';
import { Request } from '@/lib/schema/requests.type';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/sonner';
import RequestsStatusIcon from '@/components/icons/RequestsStatusIcon';

export function RequestStatusCell({ request }: { request: Request }) {
  const { data: activeRoles } = useActiveRolesQuery();
  const defaultRole = useDefaultRole();

  const approveRequestMutation = useApproveRequestMutation(request.id);
  const rejectRequestMutation = useRejectRequestMutation(request.id);
  const isMutatingRequest = useIsMutatingRequest(request.id);
  const isMutatingRequestsBulk = useIsMutatingRequestsBulk();

  async function handleApproveRequest(roleSlug: string) {
    if (isMutatingRequest || isMutatingRequestsBulk) return;
    try {
      await approveRequestMutation.mutateAsync(roleSlug);
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  }

  async function handleRejectRequest() {
    if (isMutatingRequest || isMutatingRequestsBulk) return;
    try {
      await rejectRequestMutation.mutateAsync();
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  }

  return (
    <div className="pointer-events-none">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="pointer-events-auto flex w-40 items-center justify-between px-3 py-2 font-normal capitalize"
          >
            <span className="flex items-center gap-2">
              <RequestsStatusIcon status={request.status} />
              {request.status}
            </span>
            <ChevronDown className="text-muted-foreground/70 mt-0.5 size-4 cursor-pointer" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40">
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <DropdownMenuItem className="p-0">
                  {approveRequestMutation.isPending ? (
                    <Loader2 className="text-muted-foreground size-4.5 animate-spin" />
                  ) : (
                    <RequestsStatusIcon status="approved" />
                  )}
                  {__('Approved', 'yay-wholesale-b2b')}
                </DropdownMenuItem>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() => {
                      if (!defaultRole) return;
                      handleApproveRequest(defaultRole?.slug);
                    }}
                  >
                    <RequestsStatusIcon status="approved" /> {__('Approved (Default)', 'yay-wholesale-b2b')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {activeRoles.map((role) => (
                    <DropdownMenuItem key={role.slug} onClick={() => handleApproveRequest(role.slug)}>
                      <RequestsStatusIcon status="approved" />{' '}
                      {sprintf(__('Approved to %s', 'yay-wholesale-b2b'), role.name)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuItem onClick={() => handleRejectRequest()}>
              {rejectRequestMutation.isPending ? (
                <Loader2 className="text-muted-foreground size-4.5 animate-spin" />
              ) : (
                <RequestsStatusIcon status="rejected" />
              )}{' '}
              {__('Rejected', 'yay-wholesale-b2b')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
