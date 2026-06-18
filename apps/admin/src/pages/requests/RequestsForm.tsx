import { useMatch, useNavigate, useParams } from 'react-router';

import { useSingleRequestQuery } from '@/lib/queries/requests.queries';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { EditRequestForm } from './RequestsForm/EditRequestForm';

export default function RequestsForm() {
  const { requestId: paramRequestId } = useParams();
  const isEditing = useMatch({ path: '/requests/edit/:requestId' }) !== null;
  const requestId = paramRequestId ? Number(paramRequestId) : 0;

  const navigate = useNavigate();
  const isSheetOpen = isEditing;
  const { data: request, isLoading } = useSingleRequestQuery(requestId);

  return (
    <Sheet
      open={isSheetOpen}
      onOpenChange={(open) => {
        if (!open) navigate('/requests');
      }}
    >
      <SheetContent hasMargin>
        {isEditing && isLoading && <SheetSkeleton />}
        {isEditing && request !== undefined && <EditRequestForm request={request} />}
      </SheetContent>
    </Sheet>
  );
}

function SheetSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-5">
      <Skeleton className="h-4 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      <Skeleton className="h-8 w-full" />
    </div>
  );
}
