import { useQuery } from '@tanstack/react-query';
import { Users, Megaphone, ShoppingCart, TrendingUp } from 'lucide-react';
import { StatCard } from '../../components/shared/StatCard';
import { getCampaigns } from '../../api/campaigns';
import { getCustomers } from '../../api/customers';
import { CampaignsByStatusChart } from './CampaignsByStatusChart';
import { RecentCampaigns } from './RecentCampaigns';

// Dashboard page — CRM ka overview page
export function DashboardPage() {
  // Customers ka total count fetch karna
  const { data: customersData, isLoading: loadingCustomers } = useQuery({
    queryKey: ['customers', 'summary'],
    queryFn: () => getCustomers({ limit: 1 }),
  });

  // Campaigns data fetch karna — stats ke liye
  const { data: campaignsData, isLoading: loadingCampaigns } = useQuery({
    queryKey: ['campaigns', 'all'],
    queryFn: () => getCampaigns({ limit: 100 }),
  });

  const totalCustomers = customersData?.pagination?.total ?? 0;
  const totalCampaigns = campaignsData?.pagination?.total ?? 0;
  const campaigns = campaignsData?.data ?? [];

  // Campaign status counts nikalna
  const runningCampaigns = campaigns.filter((c) => c.status === 'Running').length;
  const completedCampaigns = campaigns.filter((c) => c.status === 'Completed').length;
  const totalAudience = campaigns.reduce((sum, c) => sum + (c.audienceCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Customers"
          value={totalCustomers.toLocaleString()}
          icon={Users}
          color="blue"
          loading={loadingCustomers}
        />
        <StatCard
          label="Total Campaigns"
          value={totalCampaigns.toLocaleString()}
          icon={Megaphone}
          color="purple"
          loading={loadingCampaigns}
        />
        <StatCard
          label="Running"
          value={runningCampaigns}
          icon={TrendingUp}
          color="green"
          loading={loadingCampaigns}
        />
        <StatCard
          label="Total Audience"
          value={totalAudience.toLocaleString()}
          icon={ShoppingCart}
          color="orange"
          loading={loadingCampaigns}
        />
      </div>

      {/* Charts + Recent Campaigns */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Bar Chart — campaign status breakdown */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Campaign Performance</h2>
            <p className="text-xs text-gray-400 mt-0.5">Campaigns by status</p>
          </div>
          <CampaignsByStatusChart campaigns={campaigns} loading={loadingCampaigns} />
        </div>

        {/* Recent Campaigns list */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Campaigns</h2>
            <p className="text-xs text-gray-400 mt-0.5">Last 5 campaigns</p>
          </div>
          <RecentCampaigns campaigns={campaigns.slice(0, 5)} loading={loadingCampaigns} />
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Completed Campaigns</p>
          <p className="text-2xl font-bold text-gray-900">{completedCampaigns}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Draft Campaigns</p>
          <p className="text-2xl font-bold text-gray-900">
            {campaigns.filter((c) => c.status === 'Draft').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Avg. Audience / Campaign</p>
          <p className="text-2xl font-bold text-gray-900">
            {totalCampaigns > 0 ? Math.round(totalAudience / totalCampaigns).toLocaleString() : 0}
          </p>
        </div>
      </div>
    </div>
  );
}
