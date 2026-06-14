import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Search, Users } from 'lucide-react';
import { previewSegment } from '../../api/segments';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/shared/DataTable';

// Segment preview page — segment criteria se live audience preview
export function SegmentsPage() {
  const [results, setResults] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Segment preview mutation — POST /api/segments/preview
  const { mutate, isPending } = useMutation({
    mutationFn: previewSegment,
    onSuccess: (data) => {
      setResults(data);
      toast.success(`Found ${data.count} matching customers`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to preview segment');
    },
  });

  const onSubmit = (data) => {
    // Empty values ko filter karo — backend validation ke liye
    const criteria = {};
    if (data.minSpent) criteria.minSpent = Number(data.minSpent);
    if (data.maxSpent) criteria.maxSpent = Number(data.maxSpent);
    if (data.inactiveDays) criteria.inactiveDays = Number(data.inactiveDays);
    if (data.city) criteria.city = data.city.trim();
    mutate(criteria);
  };

  // Preview results table columns
  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (name, row) => (
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-400">{row.email}</p>
        </div>
      ),
    },
    { key: 'city', header: 'City', render: (v) => v || '—' },
    {
      key: 'totalSpent',
      header: 'Total Spend',
      render: (v) => `₹${(v || 0).toLocaleString()}`,
    },
    {
      key: 'lastOrderDate',
      header: 'Last Order',
      render: (v) => (v ? new Date(v).toLocaleDateString('en-IN') : 'Never'),
    },
  ];

  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-gray-900 placeholder-gray-400';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-base font-semibold text-gray-900">Audience Segments</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Preview your audience by applying filter criteria before creating a campaign
        </p>
      </div>

      {/* Filter Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Segment Criteria</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {/* Min Spend */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Min Spend (₹)</label>
            <input
              type="number"
              className={inputClass}
              placeholder="e.g. 500"
              {...register('minSpent', { min: { value: 0, message: 'Must be ≥ 0' } })}
            />
            {errors.minSpent && <p className="text-xs text-red-500">{errors.minSpent.message}</p>}
          </div>

          {/* Max Spend */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Max Spend (₹)</label>
            <input
              type="number"
              className={inputClass}
              placeholder="e.g. 5000"
              {...register('maxSpent', { min: { value: 0, message: 'Must be ≥ 0' } })}
            />
            {errors.maxSpent && <p className="text-xs text-red-500">{errors.maxSpent.message}</p>}
          </div>

          {/* Inactive Days */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Inactive Days</label>
            <input
              type="number"
              className={inputClass}
              placeholder="e.g. 30"
              {...register('inactiveDays', { min: { value: 1, message: 'Must be ≥ 1' } })}
            />
            {errors.inactiveDays && <p className="text-xs text-red-500">{errors.inactiveDays.message}</p>}
          </div>

          {/* City */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">City</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. Mumbai"
              {...register('city')}
            />
          </div>
        </div>

        <Button type="submit" loading={isPending}>
          <Search size={14} />
          Preview Audience
        </Button>
      </form>

      {/* Results */}
      {results && (
        <div className="space-y-3">
          {/* Audience count badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
              <Users size={16} className="text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">
                {results.count.toLocaleString()} customers match
              </span>
            </div>
          </div>

          {/* Results table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <DataTable
              columns={columns}
              data={results.customers}
              loading={false}
              emptyTitle="No customers match these criteria"
              emptyDescription="Try adjusting your filters"
            />
          </div>
        </div>
      )}
    </div>
  );
}
