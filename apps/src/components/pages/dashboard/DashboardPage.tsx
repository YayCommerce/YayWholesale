import DashboardDateFilter from './DashboardDateFilter';
import DashboardSummary from './DashboardSummary';
import TopProducts from './TopProducts';
import TopWholesaleCustomers from './TopWholesaleCustomers';

export default function DashboardPage() {
  return (
    <div className="mx-auto mt-[84px] max-w-7xl space-y-6 px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <DashboardDateFilter />
      </div>

      {/* Summary */}
      <DashboardSummary />

      {/* Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        <TopWholesaleCustomers />
        <TopProducts />
      </div>
    </div>
  );
}
