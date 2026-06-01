import { InfoIcon } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { Settings } from '@/lib/schema/settings.schema';
import { Badge } from '@/components/ui/badge';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';
import { EnableByRoleCombobox } from '@/components/ui/enable-role-picker/EnableByRoleCombobox';
import { TableCell, TableRow } from '@/components/ui/table';

export function ShippingRows() {
  const { control, register } = useFormContext<Settings>();

  return (
    <>
      {wooShippingMethods.map((method, index) => {
        return (
          <TableRow key={method.instance_id} className="border-divider border-b">
            <TableCell className="w-80 px-2 pt-3.5 pb-1">
              <p className="text-foreground flex items-center gap-1.5 font-extrabold whitespace-pre-line">
                {method.instance_name}
                {method.description && (
                  <span>
                    <WholeSaleToolTip trigger={<InfoIcon className="size-3" />} content={method.description} />
                  </span>
                )}
              </p>
              <p className="text-muted-foreground text-xs font-normal whitespace-pre-line">{method.method_name}</p>
              <p className="text-muted-foreground mt-4 flex items-center gap-1.5 text-xs font-normal">
                {__('Shipping Zone: ', 'yay_wholesale_b2b')}
                <Badge className="" variant={method.zone_id ? 'primary-soft' : 'secondary'}>
                  {method.zone_id ? method.zone_name : __('Rest of the World', 'yay_wholesale_b2b')}
                </Badge>
              </p>
            </TableCell>
            <TableCell>
              <input type="hidden" {...register(`shipping_roles.${index}.instance_id`)} />
              <input type="hidden" {...register(`shipping_roles.${index}.zone_id`)} />
              <Controller
                name={`shipping_roles.${index}.enable_by_role`}
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

const wooShippingMethods = window.yayWholesaleB2BMeta.wcMeta.shipping_methods_info;
