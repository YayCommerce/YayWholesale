import { useMatch, useNavigate, useParams } from 'react-router-dom';
import { __ } from '@wordpress/i18n';

import { useRequestQuery } from '@/lib/queries/requests.queries';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { EditRequestForm } from './RequestsForm/EditRequestForm';

export default function RequestsForm() {
  const { requestId: paramRequestId } = useParams();
  const isEditing = useMatch({ path: '/requests/edit/:requestId' }) !== null;
  const requestId = paramRequestId ? Number(paramRequestId) : 0;

  const navigate = useNavigate();
  const isSheetOpen = isEditing;
  const { data: request, isLoading } = useRequestQuery(requestId);

  return (
    <Sheet
      open={isSheetOpen}
      onOpenChange={(open) => {
        if (!open) navigate('/requests');
      }}
    >
      <SheetContent className="overflow-x-auto md:m-2.5 md:h-[calc(100%-52px)] md:min-w-[490px] md:rounded-md">
        {isEditing && request !== undefined && <EditRequestForm request={request} />}
      </SheetContent>
    </Sheet>
  );
}
