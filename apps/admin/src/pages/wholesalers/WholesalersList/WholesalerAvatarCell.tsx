import { Wholesaler } from '@/lib/schema/wholesalers.type';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function WholesalerAvatarCell({ wholesaler }: { wholesaler: Wholesaler }) {
  const { avatar, firstName, lastName, id, email, displayName } = wholesaler;
  const name = displayName ?? `${firstName} ${lastName}`;
  const userLink = window.yayWholesaleB2BMeta.wpMeta.usersUrl.edit.replace('%USER_ID%', id.toString());

  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-9.5">
        <a href={userLink} target="_blank" rel="noopener noreferrer">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </a>
      </Avatar>
      <div>
        <a
          className="cursor-pointer leading-none font-medium hover:underline"
          href={userLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {name}
        </a>
        <p className="text-muted-foreground text-xs">{email}</p>
      </div>
    </div>
  );
}
