import { useMemo, useState } from 'react';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ChevronDownIcon, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateEffect } from 'react-use';

import { useRequestQuery, useUpdateRequestStatusMutation } from '@/lib/queries/requests';
import { useActiveRolesQuery } from '@/lib/queries/roles';
import { RequestFormValues } from '@/lib/schema/requests';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { WholeSaleToolTip } from '@/components/custom/WholeSaleToolTip';
import RequestsStatusIcon from '@/components/icons/RequestStatusIcon';

import { parseWPDate, parseWPTime } from '../common.helper';
import requestsStatusMap from './requests-table/RequestsStatusMap';

export const DEFAULT_REQUEST: RequestFormValues = {
  id: -1,
  name: '',
  email: '',
  message: '',
  status: 'pending',
  date: '',
  avatar: '',
  fields: [],
};

export default function RequestsForm() {
  const params = useParams();
  const editRequestId = params.requestId ? Number(params.requestId) : 0;

  const navigate = useNavigate();
  const isOpen = editRequestId !== 0;

  const {
    data,
    isLoading: isLoadingRequest,
    isError: isErrorRequest,
  } = useRequestQuery(editRequestId);
  const { data: rolesData } = useActiveRolesQuery();
  const updateStatusMutation = useUpdateRequestStatusMutation(editRequestId);

  const [dataDisplay, setDataDisplay] = useState(DEFAULT_REQUEST);
  const { icon, text } = useMemo(() => {
    return requestsStatusMap[dataDisplay?.status ?? 'pending'];
  }, [dataDisplay?.status]);

  const onReject = async () => {
    await updateStatusMutation.mutateAsync({ status: 'rejected', roleId: -1 });
    navigate('/request');
  };

  const onApprove = async () => {
    await updateStatusMutation.mutateAsync({ status: 'approved', roleId: -1 });
    navigate('/request');
  };

  const onApproveWithRole = async (roleId: number) => {
    await updateStatusMutation.mutateAsync({ status: 'approved', roleId });
    navigate('/request');
  };

  useUpdateEffect(() => {
    if (data?.id) setDataDisplay(data);
  }, [data]);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) navigate('/request');
      }}
    >
      <SheetContent
        side="right"
        className="top-[32px] h-[calc(100%-32px)] w-full gap-0 pt-0 md:min-w-[490px]"
      >
        {(isLoadingRequest || isErrorRequest) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
            <Spinner className="text-muted-foreground size-6 animate-spin" />
          </div>
        )}
        <SheetHeader className="border-border border-b p-5">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="flex gap-3 text-[18px] font-semibold text-[#151619]">
                {dataDisplay?.name}
                <WholeSaleToolTip
                  trigger={<div>{icon}</div>}
                  content={__('%STATUS% Request').replace('%STATUS%', text)}
                  side="bottom"
                />
              </SheetTitle>
              <SheetDescription className="text-base-muted-foreground mt-[4px] text-sm leading-[20px] font-normal">
                {__(
                  "Use the button below to approve or reject this user's wholesale user request",
                  'yay-wholesale',
                )}
              </SheetDescription>
            </div>
            <SheetClose asChild>
              <button className="mt-1 text-[#67708066] hover:text-[#677080]">
                <X className="h-5 w-5" />
              </button>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="grid gap-5 overflow-auto p-5">
          <dl className="divide-y divide-black/10">
            <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-base-secondary text-xs font-medium">
                {__('Name', 'yay-wholesale')}
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-400 sm:col-span-2 sm:mt-0">
                {dataDisplay?.name ?? ''}
              </dd>
            </div>

            <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-base-secondary text-xs font-medium">
                {__('Email', 'yay-wholesale')}
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-400 sm:col-span-2 sm:mt-0">
                {dataDisplay?.email ?? ''}
              </dd>
            </div>

            <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-base-secondary text-xs font-medium">
                {__('Registration Date', 'yay-wholesale')}
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-400 sm:col-span-2 sm:mt-0">
                {dataDisplay?.date ? parseWPDate(dataDisplay.date) : ''}{' '}
                {dataDisplay?.date ? parseWPTime(dataDisplay.date) : ''}
              </dd>
            </div>

            <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-base-secondary text-xs font-medium">
                {__('Message', 'yay-wholesale')}
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-400 sm:col-span-2 sm:mt-0">
                {dataDisplay?.message}
              </dd>
            </div>

            {dataDisplay?.fields.map((field, index) => {
              const handleDataByType = (value: string) => {
                if (field.type.toLowerCase() == 'date') {
                  return parseWPDate(value);
                }

                if (field.type.toLowerCase() == 'time') {
                  return parseWPTime(value);
                }

                return value;
              };
              return (
                <div key={index} className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-base-secondary text-xs font-medium">{field.label}</dt>
                  <dd className="mt-1 text-sm/6 text-gray-400 sm:col-span-2 sm:mt-0">
                    {handleDataByType(field.value)}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        <SheetFooter>
          <div className="flex justify-between gap-2 border-t border-[#E5E7EB] bg-white p-5">
            <SheetClose asChild>
              <Button variant="outline" className="w-fit">
                {__('Cancel', 'yay-wholesale')}
              </Button>
            </SheetClose>
            <div className="flex gap-2">
              <Button
                variant="destructive-outline"
                className="hover:bg-destructive/20 bg-destructive/10 w-fit"
                disabled={dataDisplay?.status === 'rejected' || updateStatusMutation.isPending}
                onClick={onReject}
              >
                <RequestsStatusIcon status="rejected" />
                {__('Reject', 'yay-wholesale')}
              </Button>

              <ButtonGroup>
                <Button
                  variant="success-outline"
                  className="hover:bg-success/20 bg-success/10 w-fit"
                  disabled={updateStatusMutation.isPending}
                  onClick={onApprove}
                >
                  <RequestsStatusIcon status="approved" />
                  {__('Approve', 'yay-wholesale')}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="success-outline"
                      className="hover:bg-success/20 bg-success/10"
                      disabled={updateStatusMutation.isPending}
                    >
                      <ChevronDownIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="[--radius:1rem]">
                    <DropdownMenuGroup>
                      {rolesData?.map((role) => {
                        return (
                          <DropdownMenuItem onClick={() => onApproveWithRole(role.id)}>
                            <RequestsStatusIcon status="approved" /> Approve to {role.name}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ButtonGroup>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
