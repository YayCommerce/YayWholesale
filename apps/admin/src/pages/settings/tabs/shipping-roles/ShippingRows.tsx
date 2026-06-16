import { Dot, InfoIcon } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { Settings } from '@/lib/schema/settings.schema';
import useIsTruncated from '@/hooks/useIsTruncated';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';
import { EnableByRoleCombobox } from '@/components/ui/enable-role-picker/EnableByRoleCombobox';
import { TableCell, TableRow } from '@/components/ui/table';

const ShippingZone = ({ method }: { method: (typeof wooShippingMethods)[0] }) => {
  const zoneText = method.zone_id ? method.zone_name : __('Rest of the World', 'yay_wholesale_b2b');

  const { ref, isTruncated } = useIsTruncated(zoneText, 84 * 4);

  return (
    <span ref={ref} className="truncate">
      {!isTruncated ? (
        zoneText
      ) : (
        <>
          <span className="relative cursor-default hover:underline">
            {zoneText}
            <WholeSaleToolTip
              trigger={<span className="absolute top-0 left-0 h-6 w-84 opacity-0"></span>}
              content={zoneText}
            />
          </span>
        </>
      )}
    </span>
  );
};

export function ShippingRows() {
  const { control, register } = useFormContext<Settings>();

  return (
    <>
      {wooShippingMethods.map((method, index) => {
        return (
          <TableRow key={method.instance_id} className="border-divider border-b">
            <TableCell className="w-80 px-2">
              <p className="text-foreground flex items-center gap-1.5 font-extrabold whitespace-pre-line">
                {method.instance_name}
                {method.description && (
                  <span>
                    <WholeSaleToolTip trigger={<InfoIcon className="size-3" />} content={method.description} />
                  </span>
                )}
              </p>
              <p className="text-muted-foreground flex max-w-110 items-center text-xs font-normal">
                {method.method_name} <Dot className="text-muted-foreground-400 size-4" />{' '}
                <ShippingZone method={method} />
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
