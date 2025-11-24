import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { ChevronDown } from 'lucide-react';
import { useUpdateEffect } from 'react-use';

import { useUpdateRequestStatusMutation } from '@/lib/queries/requests';
import { useActiveRolesQuery, useRolesQuery } from '@/lib/queries/roles';
import { RequestFormValues } from '@/lib/schema/requests';
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex w-40 items-center justify-between font-normal"
          disabled={
            updateStatusMutation.isPending ||
            queryClient.isMutating({ mutationKey: ['requests'] }) > 0 ||
            queryClient.isFetching({ queryKey: ['requests'] }) > 0
          }
        >
          <span className="flex gap-2">
            <RequestsStatusIcon status={status} className="mt-0.5 min-h-4 min-w-4" />
            {currentText}
          </span>
          <ChevronDown className="cursor-pointer" />
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
                          {icon} {__('Approved (Default)', 'yay-wholesale')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {roles?.map((role) => (
                          <DropdownMenuItem onClick={() => handleStatusChange(statusKey, role.id)}>
                            {icon}{' '}
                            {__('Approved to %ROLE_NAME%', 'yay-wholesale').replace(
                              '%ROLE_NAME%',
                              role.name,
                            )}
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
  );
}
