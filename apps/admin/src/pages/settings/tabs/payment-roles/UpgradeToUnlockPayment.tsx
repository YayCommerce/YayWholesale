import { UpgradeToProOverlay } from '@/components/ui/custom/upgrate-to-pro';
import { TableCell, TableRow } from '@/components/ui/table';

export function UpgradeToUnlockPayment() {
  return (
    <TableRow>
      <TableCell colSpan={2} className="h-24 text-center">
        <UpgradeToProOverlay />
      </TableCell>
    </TableRow>
  );
}
