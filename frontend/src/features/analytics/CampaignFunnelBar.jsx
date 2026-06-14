import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

// Analytics funnel bar chart — horizontal style
const COLORS = ['#3b82f6', '#22c55e', '#6366f1', '#8b5cf6', '#10b981', '#ef4444'];

export function CampaignFunnelBar({ stats }) {
  const data = [
    { name: 'Sent', value: stats.sent || 0 },
    { name: 'Delivered', value: stats.delivered || 0 },
    { name: 'Opened', value: stats.opened || 0 },
    { name: 'Clicked', value: stats.clicked || 0 },
    { name: 'Converted', value: stats.converted || 0 },
    { name: 'Failed', value: stats.failed || 0 },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Delivery Funnel</h2>
        <p className="text-xs text-gray-400 mt-0.5">Campaign message journey</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
