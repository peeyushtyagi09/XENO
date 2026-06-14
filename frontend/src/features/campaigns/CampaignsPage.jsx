import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCampaigns, deleteCampaign } from '../../api/campaigns';
import { DataTable, Pagination } from '../../components/shared/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/shared/Modal';
import { CreateCampaignModal } from './CreateCampaignModal';
import { CampaignDrawer } from './CampaignDrawer';

// Campaign statuses — tab filter ke liye
const STATUSES = ['All', 'Draft', 'Scheduled', 'Running', 'Completed'];

// Channel icon mapping
const CHANNEL_LABELS = { WhatsApp: '📱', SMS: '💬', Email: '📧', RCS: '🔷' };

// Campaigns list page — full table with filter, create, delete
export function CampaignsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const queryClient = useQueryClient();

  // Campaigns data fetch karne ke liye
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['campaigns', { page, status: statusFilter === 'All' ? undefined : statusFilter }],
    queryFn: () =>
      getCampaigns({
        page,
        limit: 10,
        ...(statusFilter !== 'All' && { status: statusFilter }),
        sortOrder: 'desc',
      }),
    keepPreviousData: true,
  });

  const campaigns = data?.data ?? [];
  const pagination = data?.pagination;

  // Delete campaign mutation
  const { mutate: doDelete, isPending: deleting } = useMutation({
    mutationFn: (id) => deleteCampaign(id),
    onSuccess: () => {
      toast.success('Campaign deleted');
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err.message),
  });

  // Table columns config
  const columns = [
    {
      key: 'name',
      header: 'Campaign',
      render: (name, row) => (
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-400">
            {CHANNEL_LABELS[row.channel] || ''} {row.channel}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (v) => <Badge>{v}</Badge>,
    },
    {
      key: 'audienceCount',
      header: 'Audience',
      render: (v) => (v || 0).toLocaleString(),
    },
    {
      key: 'segmentId',
      header: 'Segment',
      render: (v) => v?.segmentName || '—',
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (v) => new Date(v).toLocaleDateString('en-IN'),
    },
    {
      key: '_id',
      header: '',
      render: (id, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
          className="text-xs text-red-500 hover:underline"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Campaigns</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {pagination?.total ?? 0} total campaigns
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={14} />
          New Campaign
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <DataTable
          columns={columns}
          data={campaigns}
          loading={isLoading}
          error={error?.message}
          onRetry={refetch}
          onRowClick={(row) => setSelectedCampaign(row)}
          emptyTitle="No campaigns found"
          emptyDescription="Create your first campaign to get started"
        />
        <Pagination
          page={page}
          totalPages={pagination?.totalPages}
          hasNext={pagination?.hasNextPage}
          hasPrev={pagination?.hasPrevPage}
          onNext={() => setPage((p) => p + 1)}
          onPrev={() => setPage((p) => p - 1)}
        />
      </div>

      {/* Campaign Detail Drawer */}
      <CampaignDrawer
        campaign={selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
      />

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => { setShowCreate(false); refetch(); }}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => doDelete(deleteTarget._id)}
        loading={deleting}
        title="Delete Campaign"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  );
}
