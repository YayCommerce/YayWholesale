import { useMemo } from 'react';
import { Ellipsis } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Spinner } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import { useRequestQuery, useUpdateRequestStatusMutation } from '@/lib/queries/requests';
import { useActiveRolesQuery } from '@/lib/queries/roles';
import { RequestFieldValues, RequestFormValues } from '@/lib/schema/requests';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';
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
  defaultFieldLabels: {
    email: 'Email Address',
    message: 'Message',
    firstName: 'First Name',
    lastName: 'Last Name',
  },
};

const isPhoneField = (field: RequestFieldValues) => {
  return field.label.toLowerCase().includes(__('phone', 'yay-wholesale-b2b')) || field.type.toLowerCase() === 'phone';
};

export default function RequestsForm() {
  const params = useParams();
  const editRequestId = params.requestId ? Number(params.requestId) : 0;

  const navigate = useNavigate();
  const isOpen = editRequestId !== 0;

  const { data, error, isLoading: isLoadingRequest, isError: isErrorRequest } = useRequestQuery(editRequestId);
  const { data: rolesData } = useActiveRolesQuery();
  const updateStatusMutation = useUpdateRequestStatusMutation(editRequestId);

  const dataDisplay = useMemo(() => (data ? data : DEFAULT_REQUEST), [data]);
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

  const phoneFields = useMemo(() => {
    let phoneFields: RequestFormValues['fields'] = [];

    if (!dataDisplay) {
      return phoneFields;
    }
    let fields = dataDisplay.fields;

    dataDisplay.fields.forEach((field) => {
      if (isPhoneField(field)) {
        phoneFields.push(field);
      }
    });

    return phoneFields;
  }, [dataDisplay]);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) navigate('/request');
      }}
    >
      <SheetContent
        side="right"
        className="overflow-x-auto md:m-2.5 md:h-[calc(100%-52px)] md:min-w-[490px] md:rounded-md"
      >
        {(isLoadingRequest || isErrorRequest) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
            <Spinner className="text-muted-foreground size-6 animate-spin" />
          </div>
        )}
        <SheetHeader>
          <div className="flex items-start justify-between gap-2.5">
            <div>
              <SheetTitle className="text-foreground flex items-center gap-2 text-[18px] font-semibold">
                {dataDisplay?.name}
                {dataDisplay && dataDisplay.status !== 'approved' && (
                  <WholeSaleToolTip
                    trigger={
                      <div>
                        <RequestsStatusIcon status={dataDisplay?.status ?? 'pending'} className="h-3.5 w-3.5" />
                      </div>
                    }
                    content={text}
                    side="bottom"
                  />
                )}
              </SheetTitle>
              <SheetDescription className="text-muted-foreground mt-[4px] text-sm leading-[20px] font-normal">
                {__(
                  "Use the button below to approve or reject this user's wholesale user request",
                  'yay-wholesale-b2b',
                )}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div className="flex cursor-default flex-col gap-5 overflow-auto p-5">
          <div className="grid cursor-default grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">{dataDisplay?.defaultFieldLabels.firstName}</Label>
              <Input id="firstName" readOnly value={dataDisplay?.firstName} onChange={() => {}} />
            </div>
            <div className="flex cursor-default flex-col gap-2">
              <Label htmlFor="lastName">{dataDisplay?.defaultFieldLabels.lastName}</Label>
              <Input id="lastName" readOnly value={dataDisplay?.lastName} onChange={() => {}} />
            </div>
          </div>
          <div className="flex cursor-default flex-col gap-2">
            <Label htmlFor="email">{dataDisplay?.defaultFieldLabels.email}</Label>
            <Input id="email" readOnly value={dataDisplay?.email} onChange={() => {}} />
          </div>
          <div className="flex cursor-default flex-col gap-2">
            <Label htmlFor="registrationDate">{__('Registration date', 'yay-wholesale-b2b')}</Label>
            <Input
              id="registrationDate"
              readOnly
              value={dataDisplay?.date ? parseWPDate(dataDisplay.date) + ' ' + parseWPTime(dataDisplay.date) : ''}
              onChange={() => {}}
            />
          </div>

          {phoneFields.map((field, index) => {
            return (
              <div className="flex flex-col gap-2">
                <Label>{field.label}</Label>
                <Input readOnly value={field.value} onChange={() => {}} />
              </div>
            );
          })}

          <div className="flex flex-col gap-2">
            <Label htmlFor="message">{dataDisplay?.defaultFieldLabels.message}</Label>
            <Textarea
              className="h-fit min-h-25 resize-none"
              readOnly
              value={dataDisplay?.message}
              onChange={() => {}}
            />
          </div>

          {dataDisplay?.fields.map((field, index) => {
            const handleDataByType = () => {
              const value = field.value;
              if (value.length == 0) {
                return value;
              }

              if (field.type.toLowerCase() == 'date') {
                return parseWPDate(value);
              }

              if (field.type.toLowerCase() == 'time') {
                return parseWPTime(value);
              }

              return value;
            };

            return (
              !isPhoneField(field) && (
                <div className="flex flex-col gap-2">
                  <Label>{field.label}</Label>
                  {field.type.toLowerCase() === 'textarea' ? (
                    <Textarea
                      className="h-fit min-h-25 resize-none"
                      readOnly
                      value={handleDataByType()}
                      onChange={() => {}}
                    />
                  ) : (
                    <Input readOnly value={handleDataByType()} onChange={() => {}} />
                  )}
                </div>
              )
            );
          })}
        </div>

        <SheetFooter className="p-0">
          <div className="border-divider flex justify-end gap-2 border-t bg-white p-5">
            <div className="flex gap-2">
              <Button
                variant="destructive-soft"
                className="hover:bg-destructive/10 w-fit"
                disabled={dataDisplay?.status === 'rejected' || updateStatusMutation.isPending}
                onClick={onReject}
              >
                <RequestsStatusIcon status="rejected" />
                {__('Reject', 'yay-wholesale-b2b')}
              </Button>

              <ButtonGroup>
                <Button
                  variant="outline"
                  className="w-fit"
                  disabled={updateStatusMutation.isPending}
                  onClick={onApprove}
                >
                  <RequestsStatusIcon status="approved" className="text-foreground" />
                  {__('Approve', 'yay-wholesale-b2b')}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={updateStatusMutation.isPending}>
                      <Ellipsis />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuContent align="end" className="z-100000 [--radius:1rem]">
                      <DropdownMenuGroup>
                        {rolesData?.map((role) => {
                          return (
                            <DropdownMenuItem onClick={() => onApproveWithRole(role.id)}>
                              <RequestsStatusIcon status="approved" />{' '}
                              {sprintf(__('Approve to %s', 'yay-wholesale-b2b'), role.name)}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenuPortal>
                </DropdownMenu>
              </ButtonGroup>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
