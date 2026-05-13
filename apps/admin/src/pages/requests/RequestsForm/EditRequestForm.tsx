import { useMemo } from 'react';
import { Ellipsis } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { __, sprintf } from '@wordpress/i18n';

import { parseWPDate, parseWPTime } from '@/lib/helpers/format.helper';
import { getErrorMsg } from '@/lib/helpers/response.helper';
import {
  useApproveRequestMutation,
  useIsMutatingRequest,
  useRejectRequestMutation,
} from '@/lib/queries/requests.queries';
import { useActiveRolesQuery, useDefaultRole } from '@/lib/queries/roles.queries';
import { Request, RequestField } from '@/lib/schema/requests.type';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';
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
import { SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import RequestsStatusIcon from '@/components/icons/RequestsStatusIcon';

export function EditRequestForm({ request }: { request: Request }) {
  const navigate = useNavigate();
  const { data: activeRoles } = useActiveRolesQuery();
  const defaultRole = useDefaultRole();

  const updateStatusMutation = useApproveRequestMutation(request.id);
  const rejectStatusMutation = useRejectRequestMutation(request.id);
  const isMutating = useIsMutatingRequest(request.id);

  async function handleApproveRequest(roleSlug: string) {
    if (isMutating > 0) return;
    try {
      await updateStatusMutation.mutateAsync(roleSlug);
      toast.success(__('Request approved successfully', 'yay-wholesale-b2b'));
      navigate('/requests');
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  }

  async function handleRejectRequest() {
    if (isMutating > 0) return;
    try {
      await rejectStatusMutation.mutateAsync();
      toast.success(__('Request rejected successfully', 'yay-wholesale-b2b'));
      navigate('/requests');
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  }

  const phoneFields = useMemo(() => {
    let phoneFields: RequestField[] = [];

    if (!request) {
      return phoneFields;
    }
    let fields = request.fields;

    request.fields.forEach((field) => {
      if (isPhoneField(field)) {
        phoneFields.push(field);
      }
    });

    return phoneFields;
  }, [request]);

  return (
    <>
      <SheetHeader>
        <div className="flex items-start justify-between gap-2.5">
          <div>
            <SheetTitle className="text-foreground flex items-center gap-2 text-[18px] font-semibold">
              {request.name}
              {request.status !== 'approved' && (
                <WholeSaleToolTip
                  trigger={
                    <div>
                      <RequestsStatusIcon status={request.status ?? 'pending'} className="h-3.5 w-3.5" />
                    </div>
                  }
                  content={<span className="capitalize">{request.status}</span>}
                  side="bottom"
                />
              )}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground mt-[4px] text-sm leading-[20px] font-normal">
              {__("Use the button below to approve or reject this user's wholesale user request", 'yay-wholesale-b2b')}
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>
      <div className="flex cursor-default flex-col gap-5 overflow-auto p-5">
        <div className="grid cursor-default grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName">{request.defaultFieldLabels.firstName}</Label>
            <Input id="firstName" readOnly value={request.firstName} onChange={() => {}} />
          </div>
          <div className="flex cursor-default flex-col gap-2">
            <Label htmlFor="lastName">{request.defaultFieldLabels.lastName}</Label>
            <Input id="lastName" readOnly value={request.lastName} onChange={() => {}} />
          </div>
        </div>
        <div className="flex cursor-default flex-col gap-2">
          <Label htmlFor="email">{request.defaultFieldLabels.email}</Label>
          <Input id="email" readOnly value={request.email} onChange={() => {}} />
        </div>
        <div className="flex cursor-default flex-col gap-2">
          <Label htmlFor="registrationDate">{__('Registration date', 'yay-wholesale-b2b')}</Label>
          <Input
            id="registrationDate"
            readOnly
            value={request.date ? parseWPDate(request.date) + ' ' + parseWPTime(request.date) : ''}
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
          <Label htmlFor="message">{request.defaultFieldLabels.message}</Label>
          <Textarea className="h-fit min-h-25 resize-none" readOnly value={request.message} onChange={() => {}} />
        </div>

        {request.fields.map((field, index) => {
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
            <Button variant="destructive-soft" className="hover:bg-destructive/10 w-fit" onClick={handleRejectRequest}>
              <RequestsStatusIcon status="rejected" />
              {__('Reject', 'yay-wholesale-b2b')}
            </Button>

            <ButtonGroup>
              <Button
                variant="outline"
                className="w-fit"
                disabled={request.status === 'rejected' || updateStatusMutation.isPending}
                onClick={() => {
                  if (!defaultRole) return;
                  handleApproveRequest(defaultRole.slug);
                }}
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
                      {activeRoles.map((role) => {
                        return (
                          <DropdownMenuItem key={role.slug} onClick={() => handleApproveRequest(role.slug)}>
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
    </>
  );
}

const isPhoneField = (field: RequestField) => {
  return field.label.toLowerCase().includes(__('phone', 'yay-wholesale-b2b')) || field.type.toLowerCase() === 'phone';
};
