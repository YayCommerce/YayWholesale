export type TopWholesaler = {
  id: number;
  name: string;
  avatar: string;
  role: string;
  orderCount: number;
};

export type TopProduct = {
  name: string;
  image: string;
  orderCount: number;
  netSale: string;
};

export type DashboardReports = {
  wholesalersAmount: number;
  wholesalersIncreaseRate: number;
  orderAmount: number;
  orderIncreaseRate: number;
  revenue: number;
  revenueIncreaseRate: number;
  topWholesalers: TopWholesaler[];
  topProducts: TopProduct[];
};
