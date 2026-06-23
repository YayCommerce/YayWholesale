import { Row } from '@tanstack/react-table';

import { useUserCountByRoleQuery } from '@/lib/queries/roles.queries';
import { Role } from '@/lib/schema/roles.schema';
import { cn } from '@/lib/utils';

export function RoleCountCell({ row }: { row: Row<Role> }) {
  const { data: count } = useUserCountByRoleQuery(row.original.slug);
  const hasUser = count && count > 0;

  return (
    <div
      className={cn('text-center', hasUser ? 'cursor-pointer hover:underline' : '')}
      onClick={() => {
        if (hasUser) {
          window.open(window.yayWholesaleB2BMeta.wpMeta.usersUrl.list + '?role=' + row.original.slug, '_blank');
        }
      }}
    >
      {count ?? '...'}
    </div>
  );
}
