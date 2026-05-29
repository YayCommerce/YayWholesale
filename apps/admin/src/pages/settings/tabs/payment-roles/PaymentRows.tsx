import { InfoIcon } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import { object } from 'zod';

import { Settings } from '@/lib/schema/settings.schema';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';
import { EnableByRoleCombobox } from '@/components/ui/enable-role-picker/EnableByRoleCombobox';
import { TableCell, TableRow } from '@/components/ui/table';

export function PaymentRows() {
  const { control, register } = useFormContext<Settings>();

  return (
    <>
      {wooPaymentMethods.map((method, index) => {
        return (
          <TableRow key={method.method_id} className="border-divider border-b">
            <TableCell className="w-80 px-2 py-3.5">
              <p className="text-foreground flex items-center gap-1.5 font-extrabold whitespace-pre-line">
                {method.method_title}
                {method.description && (
                  <span>
                    <WholeSaleToolTip trigger={<InfoIcon className="h-3 w-3" />} content={method.description} />
                  </span>
                )}
              </p>
              <p className="text-muted-foreground text-xs font-normal whitespace-pre-line">{method.title}</p>
            </TableCell>
            <TableCell>
              <input type="hidden" {...register(`payment_roles.${index}.method_id`)} />
              <Controller
                name={`payment_roles.${index}.enable_by_role`}
                control={control}
                render={({ field }) => {
                  return (
                    <EnableByRoleCombobox
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                      }}
                    />
                  );
                }}
              />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}

const wooPaymentMethods = window.yayWholesaleB2BMeta.wcMeta.payment_methods_info;
