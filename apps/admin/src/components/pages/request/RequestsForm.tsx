import { useMemo, useState } from 'react';
import { Spinner } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Ellipsis, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateEffect } from 'react-use';

import { useRequestQuery, useUpdateRequestStatusMutation } from '@/lib/queries/requests';
import { useActiveRolesQuery } from '@/lib/queries/roles';
import { RequestFormValues } from '@/lib/schema/requests';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { WholeSaleToolTip } from '@/components/custom/WholeSaleToolTip';
import RequestsStatusIcon from '@/components/icons/RequestStatusIcon';

import { parseWPDate, parseWPTime } from '../common.helper';
import requestsStatusMap from './requests-table/RequestsStatusMap';

export const DEFAULT_REQUEST: RequestFormValues = {
  id: -1,
  name: '',
  email: '',
  message: '',
  firstName: '',
  lastName: '',
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

  const readonlyClassName = useMemo(
    () => 'border-border bg-base-muted hover:border-border cursor-default shadow-xs',
    [],
  );

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
        <SheetHeader className="border-b border-[#F4F4F5] p-5">
          <div className="flex items-start justify-between gap-2.5">
            <div>
              <SheetTitle className="text-foreground flex items-center gap-2 text-[18px] font-semibold">
                {dataDisplay?.name}
                {dataDisplay && dataDisplay.status !== 'approved' && (
                  <WholeSaleToolTip
                    trigger={
                      <div>
                        <RequestsStatusIcon
                          status={dataDisplay?.status ?? 'pending'}
                          className="h-3.5 w-3.5"
                        />
                      </div>
                    }
                    content={text}
                    side="bottom"
                  />
                )}
              </SheetTitle>
              <SheetDescription className="text-base-muted-foreground mt-[4px] text-sm leading-[20px] font-normal">
                {__(
                  "Use the button below to approve or reject this user's wholesale user request",
                  'yay-wholesale',
                )}
              </SheetDescription>
            </div>
            <SheetClose asChild>
              <button className="hover:text-muted-foreground mt-1 text-[#67708066]">
                <X className="h-5 w-5" />
              </button>
            </SheetClose>
          </div>
        </SheetHeader>
        <div className="flex cursor-default flex-col gap-5 overflow-auto p-5">
          <div className="grid cursor-default grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">{__('First Name', 'yay-wholesale')}</Label>
              <Input
                id="firstName"
                readOnly
                value={dataDisplay?.firstName}
                className={cn(readonlyClassName)}
              />
            </div>
            <div className="flex cursor-default flex-col gap-2">
              <Label htmlFor="lastName">{__('Last Name', 'yay-wholesale')}</Label>
              <Input
                id="lastName"
                readOnly
                value={dataDisplay?.lastName}
                className={cn(readonlyClassName)}
              />
            </div>
          </div>
          <div className="flex cursor-default flex-col gap-2">
            <Label htmlFor="email">{__('Email address', 'yay-wholesale')}</Label>
            <Input
              id="email"
              readOnly
              value={dataDisplay?.email}
              className={cn(readonlyClassName)}
            />
          </div>
          <div className="flex cursor-default flex-col gap-2">
            <Label htmlFor="registrationDate">{__('Registration date', 'yay-wholesale')}</Label>
            <Input
              id="registrationDate"
              readOnly
              className={cn(readonlyClassName)}
              value={
                dataDisplay?.date
                  ? parseWPDate(dataDisplay.date) + ' ' + parseWPTime(dataDisplay.date)
                  : ''
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="message">{__('Message', 'yay-wholesale')}</Label>
            <Textarea
              className={cn('h-fit min-h-25 resize-none', readonlyClassName)}
              readOnly
              value={dataDisplay.message}
            />
          </div>
          {dataDisplay?.fields.map((field, index) => {
            const handleDataByType = () => {
              const value = field.value;
              if (field.type.toLowerCase() == 'date') {
                return parseWPDate(value);
              }

              if (field.type.toLowerCase() == 'time') {
                return parseWPTime(value);
              }

              return value;
            };
            return (
              <div className="flex flex-col gap-2">
                <Label>{field.label}</Label>
                {field.type.toLowerCase() === 'textarea' ? (
                  <Textarea
                    className={cn('h-fit min-h-25 resize-none', readonlyClassName)}
                    readOnly
                    value={handleDataByType()}
                  />
                ) : (
                  <Input readOnly value={handleDataByType()} className={cn(readonlyClassName)} />
                )}
              </div>
            );
          })}
        </div>

        <SheetFooter className="p-0">
          <div className="flex justify-end gap-2 border-t border-[#F4F4F5] bg-white p-5">
            <div className="flex gap-2">
              <Button
                variant="destructive-soft"
                className="hover:bg-destructive/10 w-fit"
                disabled={dataDisplay?.status === 'rejected' || updateStatusMutation.isPending}
                onClick={onReject}
              >
                <RequestsStatusIcon status="rejected" />
                {__('Reject', 'yay-wholesale')}
              </Button>

              <ButtonGroup>
                <Button
                  variant="outline"
                  className="w-fit"
                  disabled={updateStatusMutation.isPending}
                  onClick={onApprove}
                >
                  <RequestsStatusIcon status="approved" className="text-foreground" />
                  {__('Approve', 'yay-wholesale')}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={updateStatusMutation.isPending}>
                      <Ellipsis />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="[--radius:1rem]">
                    <DropdownMenuGroup>
                      {rolesData?.map((role) => {
                        return (
                          <DropdownMenuItem onClick={() => onApproveWithRole(role.id)}>
                            <RequestsStatusIcon status="approved" />{' '}
                            {sprintf(__('Approve to %s', 'yay-wholesale'), role.name)}
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
