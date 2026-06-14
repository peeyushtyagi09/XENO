// Funnel metric cards — sent, delivered, opened, clicked, failed, converted

const FUNNEL_CONFIG = [
  { key: 'sent', label: 'Sent', color: 'bg-blue-50 text-blue-700', border: 'border-blue-100' },
  { key: 'delivered', label: 'Delivered', color: 'bg-green-50 text-green-700', border: 'border-green-100' },
  { key: 'opened', label: 'Opened', color: 'bg-indigo-50 text-indigo-700', border: 'border-indigo-100' },
  { key: 'clicked', label: 'Clicked', color: 'bg-purple-50 text-purple-700', border: 'border-purple-100' },
  { key: 'converted', label: 'Converted', color: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-100' },
  { key: 'failed', label: 'Failed', color: 'bg-red-50 text-red-700', border: 'border-red-100' },
];

export function FunnelCards({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {FUNNEL_CONFIG.map(({ key, label, color, border }) => {
        const value = stats[key] ?? 0;
        const rate = stats.sent > 0 ? ((value / stats.sent) * 100).toFixed(1) : '0.0';
        return (
          <div
            key={key}
            className={`bg-white border ${border} rounded-xl p-4 flex flex-col gap-1`}
          >
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-xl font-bold ${color} rounded-lg px-0`}>{value.toLocaleString()}</p>
            <p className="text-xs text-gray-400">{rate}% of sent</p>
          </div>
        );
      })}
    </div>
  );
}
