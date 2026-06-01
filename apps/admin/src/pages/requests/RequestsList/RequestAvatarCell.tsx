import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { cacheRequest } from '@/lib/queries/requests.queries';
import { Request } from '@/lib/schema/requests.type';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function RequestAvatarCell({ request }: { request: Request }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { avatar, name, id, email } = request;

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-9.5 w-9.5">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p
          className="cursor-pointer leading-none font-medium hover:underline"
          onClick={() => {
            cacheRequest(queryClient, request);
            navigate(`/requests/edit/${id}`);
          }}
        >
          {name}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">{email}</p>
      </div>
    </div>
  );
}
