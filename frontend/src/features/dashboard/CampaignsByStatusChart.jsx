import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Skeleton } from '../../components/ui/Skeleton';

// Status colors — Recharts bar chart me use honge
const STATUS_COLORS = {
  Draft: '#9ca3af',
  Scheduled: '#3b82f6',
  Running: '#22c55e',
  Completed: '#8b5cf6',
  Failed: '#ef4444',
};

// Campaign status breakdown chart — bar chart
export function CampaignsByStatusChart({ campaigns, loading }) {
  if (loading) {
    return <Skeleton className="h-48 w-full" />;
  }

  // Status counts calculate karna
  const statusCounts = ['Draft', 'Scheduled', 'Running', 'Completed', 'Failed'].map(
    (status) => ({
      status,
      count: campaigns.filter((c) => c.status === status).length,
    })
  );

  if (campaigns.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-400">
        No campaign data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={statusCounts} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#6b7280' }} />
        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {statusCounts.map(({ status }) => (
            <Cell key={status} fill={STATUS_COLORS[status] || '#6b7280'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
