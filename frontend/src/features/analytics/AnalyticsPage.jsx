import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCampaigns } from '../../api/campaigns';
import { getCampaignStats } from '../../api/analytics';
import { FunnelCards } from './FunnelCards';
import { CampaignFunnelBar } from './CampaignFunnelBar';
import { CampaignPieChart } from './CampaignPieChart';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/States';

// Analytics page — campaign select karke funnel stats dekhte hain
export function AnalyticsPage() {
  const [selectedId, setSelectedId] = useState('');

  // Saare campaigns fetch karna — dropdown ke liye
  const { data: campaignsData, isLoading: loadingCampaigns } = useQuery({
    queryKey: ['campaigns', 'all-analytics'],
    queryFn: () => getCampaigns({ limit: 100 }),
  });

  const campaigns = campaignsData?.data ?? [];

  // Selected campaign ka stats fetch karna
  const {
    data: statsData,
    isLoading: loadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ['campaign-stats', selectedId],
    queryFn: () => getCampaignStats(selectedId),
    enabled: !!selectedId,
  });

  const stats = statsData?.data;
  const selectedCampaign = campaigns.find((c) => c._id === selectedId);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-base font-semibold text-gray-900">Analytics</h1>
        <p className="text-xs text-gray-500 mt-0.5">Campaign delivery funnel analysis</p>
      </div>

      {/* Campaign selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
        <label className="text-xs font-medium text-gray-600 whitespace-nowrap">Select Campaign</label>
        {loadingCampaigns ? (
          <Skeleton className="h-9 w-64" />
        ) : (
          <select
            className="flex-1 max-w-sm px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-gray-900"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">— Choose a campaign —</option>
            {campaigns.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.status})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Stats content */}
      {!selectedId ? (
        <EmptyState
          title="Select a campaign to view analytics"
          description="Choose a campaign from the dropdown above to see its delivery funnel"
        />
      ) : loadingStats ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : statsError ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-600">
          Failed to load analytics: {statsError.message}
        </div>
      ) : stats ? (
        <div className="space-y-5">
          {/* Campaign info bar */}
          {selectedCampaign && (
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{selectedCampaign.name}</span>
              <span className="mx-2 text-gray-300">·</span>
              <span>{selectedCampaign.channel}</span>
              <span className="mx-2 text-gray-300">·</span>
              <span>{(selectedCampaign.audienceCount || 0).toLocaleString()} audience</span>
            </div>
          )}

          {/* Funnel metric cards */}
          <FunnelCards stats={stats} />

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <CampaignFunnelBar stats={stats} />
            </div>
            <div>
              <CampaignPieChart stats={stats} />
            </div>
          </div>

          {/* Conversion rates table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Conversion Rates</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Metric</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Count</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rate (of Sent)</th>
                </tr>
              </thead>
              <tbody>
                {['delivered', 'opened', 'clicked', 'converted', 'failed'].map((key) => {
                  const rate = stats.sent > 0 ? ((stats[key] / stats.sent) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={key} className="border-b border-gray-100">
                      <td className="px-5 py-3 capitalize text-gray-700 font-medium">{key}</td>
                      <td className="px-5 py-3 text-gray-700">{(stats[key] || 0).toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-24">
                            <div
                              className="h-1.5 rounded-full bg-blue-500"
                              style={{ width: `${Math.min(rate, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
