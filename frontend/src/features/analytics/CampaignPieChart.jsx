import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Pie chart — delivered vs failed vs in-funnel breakdown
const PIE_COLORS = ['#22c55e', '#ef4444', '#3b82f6'];

export function CampaignPieChart({ stats }) {
  const total = stats.sent || 0;
  const delivered = stats.delivered || 0;
  const failed = stats.failed || 0;
  const inFlight = Math.max(0, total - delivered - failed);

  const data = [
    { name: 'Delivered', value: delivered },
    { name: 'Failed', value: failed },
    { name: 'In Transit', value: inFlight },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Delivery Split</h2>
        <p className="text-xs text-gray-400 mt-0.5">Delivered vs Failed</p>
      </div>
      {data.length === 0 ? (
        <div className="h-44 flex items-center justify-center text-sm text-gray-400">
          No data to display
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
