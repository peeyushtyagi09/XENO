import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Link } from 'react-router-dom';

// Recent campaigns list — dashboard pe last 5 campaigns
export function RecentCampaigns({ campaigns, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!campaigns?.length) {
    return <p className="text-xs text-gray-400 text-center py-6">No campaigns yet</p>;
  }

  return (
    <div className="space-y-3">
      {campaigns.map((c) => (
        <div key={c._id} className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
            <p className="text-xs text-gray-400">{c.channel} · {c.audienceCount?.toLocaleString()} recipients</p>
          </div>
          <Badge>{c.status}</Badge>
        </div>
      ))}
      <Link
        to="/campaigns"
        className="block text-center text-xs text-blue-600 hover:underline mt-4"
      >
        View all campaigns →
      </Link>
    </div>
  );
}
