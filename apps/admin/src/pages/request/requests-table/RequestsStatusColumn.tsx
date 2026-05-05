import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { useUpdateEffect } from 'react-use';
import { __, sprintf } from '@wordpress/i18n';

import { useUpdateRequestStatusMutation } from '@/lib/queries/requests.queries';
import { useActiveRolesQuery, useRolesQuery } from '@/lib/queries/roles.queries';
import { RequestFormValues } from '@/lib/schema/requests.type';
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
import RequestsStatusIcon from '@/components/icons/RequestStatusIcon';
import requestsStatusMap from './RequestsStatusMap';

export default function RequestsStatusColumn({
  requestId,
  defaultValue,
}: {
  requestId: number;
  defaultValue: RequestFormValues['status'];
}) {
  const [status, setStatus] = useState(defaultValue);
  const { text: currentText } = useMemo(() => {
    return requestsStatusMap[status];
  }, [status]);

  const { data: roles } = useActiveRolesQuery();
  const queryClient = useQueryClient();
  const updateStatusMutation = useUpdateRequestStatusMutation(requestId);

  const handleStatusChange = (key: string, role: number = -1) => {
    const statusKey = key as RequestFormValues['status'];
    updateStatusMutation.mutate({ status: statusKey, roleId: role });
  };

  useUpdateEffect(() => {
    setStatus(defaultValue);
  }, [defaultValue]);

  return (
    <div className="pointer-events-none">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="pointer-events-auto flex w-40 items-center justify-between pr-1.5! font-normal"
            disabled={updateStatusMutation.isPending || queryClient.isMutating({ mutationKey: ['requests'] }) > 0}
          >
            <span className="flex items-center gap-2">
              <RequestsStatusIcon status={status} className="mt-0.5 min-h-4 min-w-4" />
              {currentText}
            </span>
            <ChevronDown className="text-muted-foreground/70 mt-0.5 h-6 w-6 cursor-pointer" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40">
          <DropdownMenuGroup>
            {Object.entries(requestsStatusMap).map(([statusKey, statusConfig]) => {
              const { icon, text } = statusConfig;
              return (
                <>
                  {statusKey === 'approved' ? (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <DropdownMenuItem className="p-0">
                          {icon} {text}
                        </DropdownMenuItem>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => handleStatusChange(statusKey)}>
                            {icon} {__('Approved (Default)', 'yay-wholesale-b2b')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {roles?.map((role) => (
                            <DropdownMenuItem onClick={() => handleStatusChange(statusKey, role.id)}>
                              {icon} {sprintf(__('Approved to %s', 'yay-wholesale-b2b'), role.name)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  ) : (
                    statusKey !== 'pending' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(statusKey)}>
                        {icon} {text}
                      </DropdownMenuItem>
                    )
                  )}
                </>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
