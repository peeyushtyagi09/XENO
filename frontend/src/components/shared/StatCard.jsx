import { CardSkeleton } from '../ui/Skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Stat card — dashboard pe metrics dikhane ke liye
export function StatCard({ label, value, icon: Icon, trend, trendLabel, color = 'blue', loading }) {
  if (loading) return <CardSkeleton />;

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };

  const isPositive = trend >= 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        {Icon && (
          <div className={`p-2 rounded-lg ${colorMap[color]}`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        {trendLabel && (
          <div className={`flex items-center gap-1 mt-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
