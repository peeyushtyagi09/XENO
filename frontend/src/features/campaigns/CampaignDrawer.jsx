import { useQuery } from '@tanstack/react-query';
import { Megaphone, Users, Calendar } from 'lucide-react';
import { Drawer } from '../../components/shared/Drawer';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { getCampaignById } from '../../api/campaigns';

// Campaign detail drawer — campaign ki poori details + stats link
export function CampaignDrawer({ campaign, onClose }) {
  // Fresh campaign data by ID
  const { data, isLoading } = useQuery({
    queryKey: ['campaign', campaign?._id],
    queryFn: () => getCampaignById(campaign._id),
    enabled: !!campaign?._id,
  });

  const c = data?.data || campaign;

  return (
    <Drawer isOpen={!!campaign} onClose={onClose} title="Campaign Details" size="md">
      {isLoading ? (
        <div className="p-5 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : c ? (
        <div className="p-5 space-y-5">
          {/* Campaign header */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-base font-semibold text-gray-900 flex-1">{c.name}</h3>
              <Badge>{c.status}</Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Megaphone size={12} />
                {c.channel}
              </span>
              <span className="flex items-center gap-1">
                <Users size={12} />
                {(c.audienceCount || 0).toLocaleString()} recipients
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(c.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>

          {/* Segment info */}
          {c.segmentId && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Segment</p>
              <p className="text-sm font-medium text-gray-900">{c.segmentId.segmentName}</p>
              {c.segmentId.description && (
                <p className="text-xs text-gray-400 mt-0.5">{c.segmentId.description}</p>
              )}
              <div className="mt-2">
                <span className={`text-xs px-2 py-0.5 rounded ${c.segmentId.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.segmentId.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          )}

          {/* Message */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Message</p>
            <p className="text-sm text-gray-700 leading-relaxed">{c.message}</p>
          </div>

          {/* Audience Stat */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 font-medium mb-1">Audience Size</p>
              <p className="text-xl font-bold text-blue-700">{(c.audienceCount || 0).toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-xs text-purple-600 font-medium mb-1">Channel</p>
              <p className="text-xl font-bold text-purple-700">{c.channel}</p>
            </div>
          </div>

          {/* ID and timestamps */}
          <div className="text-xs text-gray-400 space-y-1 pt-2 border-t border-gray-100">
            <p>ID: <span className="font-mono">{c._id}</span></p>
            <p>Created: {new Date(c.createdAt).toLocaleString('en-IN')}</p>
            {c.updatedAt && <p>Updated: {new Date(c.updatedAt).toLocaleString('en-IN')}</p>}
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}
