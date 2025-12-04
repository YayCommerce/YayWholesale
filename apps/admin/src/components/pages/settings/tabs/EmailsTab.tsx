import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WholeSaleToolTip } from '@/components/custom/WholeSaleToolTip';

export default function EmailsTab() {
  const { wholesale_emails } = window.yayWholesale;

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#f6f6f7] hover:bg-[#f6f6f7]">
            <TableHead className="w-12"></TableHead>
            <TableHead className="text-base-foreground text-sm font-medium">Emails</TableHead>
            {/* <TableHead className="text-sm font-medium text-base-foreground">Content type</TableHead> */}
            <TableHead className="text-base-foreground text-sm font-medium">Description</TableHead>
            <TableHead className="text-base-foreground text-sm font-medium">Recipient(s)</TableHead>
            <TableHead className="w-24 text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wholesale_emails.map((email) => (
            <TableRow key={email.id} className="h-[52px] border-b last:border-0">
              <TableCell className="px-4">
                {email.status ? (
                  <WholeSaleToolTip
                    trigger={
                      <span className="relative block flex h-[1em] w-[1em] items-center justify-center overflow-hidden indent-[-9999px] text-[1.4em] before:absolute before:top-0 before:left-0 before:h-full before:w-full before:text-center before:[text-indent:0] before:font-[WooCommerce] before:leading-[1] before:font-normal before:text-[#007cba] before:content-['\e015']"></span>
                    }
                    content="Enabled"
                  />
                ) : (
                  <WholeSaleToolTip
                    trigger={
                      <span className="relative block h-[1em] w-[1em] overflow-hidden indent-[-9999px] text-[1.4em] before:absolute before:top-0 before:left-0 before:h-full before:w-full before:text-center before:[text-indent:0] before:font-[WooCommerce] before:leading-[1] before:font-normal before:text-[#cccccc] before:content-['\e013']"></span>
                    }
                    content="Disabled"
                  />
                )}
              </TableCell>
              <TableCell className="cursor-pointer text-sm font-medium">
                <a href={email.url} className="text-primary cursor-pointer hover:underline">
                  {email.title}
                </a>
              </TableCell>
              {/* <TableCell className="text-base-foreground text-center">{email.type}</TableCell> */}
              <TableCell className="text-base-foreground">{email.description}</TableCell>
              <TableCell className="text-base-foreground">
                {email.recipients || 'Customer'}
              </TableCell>
              <TableCell className="px-4 text-center">
                <a
                  href={email.url}
                  className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-8 items-center justify-center rounded-md border px-3 py-1 text-sm font-medium ring-0 transition-colors outline-none"
                >
                  Manage
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
