import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TabsContent } from '@/components/ui/tabs';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  recipients: string;
}

const emailTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'New wholesale order is placed',
    description: 'Notify when a new wholesale order is placed',
    recipients: 'shop-owner@email.com',
  },
  {
    id: '2',
    name: 'New wholesale account register',
    description: 'Notify when a user registers a wholesale account',
    recipients: 'Customer',
  },
  {
    id: '3',
    name: 'Wholesale account is approved',
    description: 'Notify when a wholesale account is approved',
    recipients: 'Customer',
  },
  {
    id: '4',
    name: 'Wholesale account is rejected',
    description: 'Notify when a wholesale account is rejected',
    recipients: 'Customer',
  },
  {
    id: '5',
    name: 'Wholesale account is pending',
    description: 'Notify when a wholesale account is pending',
    recipients: 'Customer',
  },
];

export default function EmailsTab() {
  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#f6f6f7] hover:bg-[#f6f6f7]">
            <TableHead className="w-12">
              <Checkbox aria-label="Select all" />
            </TableHead>
            <TableHead className="text-sm font-medium text-[#171719]">Email templates</TableHead>
            <TableHead className="text-sm font-medium text-[#171719]">Description</TableHead>
            <TableHead className="text-sm font-medium text-[#171719]">Recipient(s)</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {emailTemplates.map((email) => (
            <TableRow key={email.id} className="border-b last:border-0">
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell className="cursor-pointer text-sm font-medium text-[#2271B1] hover:underline">
                {email.name}
              </TableCell>
              <TableCell className="text-gray-600">{email.description}</TableCell>
              <TableCell className="text-gray-600">{email.recipients}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" className="h-8 text-sm font-medium">
                  Manage
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
