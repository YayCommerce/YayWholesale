export type Wholesaler = {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar: string;
  email: string;

  wholesaleRoleSlug: string;
  completedOrdersCount: number;
  wholesaleRevenue: number;
};

export type WholesalerFilter = {
  roleSlug?: string;
  search: string;
  page: number;
  perPage: number;
};
