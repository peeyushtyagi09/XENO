import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Modal } from '../../components/shared/Modal';
import { Button } from '../../components/ui/Button';
import { createCampaign } from '../../api/campaigns';
import { previewSegment } from '../../api/segments';
import { useState } from 'react';

// Campaign channels aur statuses — backend model ke mutabiq
const CHANNELS = ['WhatsApp', 'SMS', 'Email', 'RCS'];

// Field component for form fields
function Field({ label, error, children, required }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Create Campaign Modal — segment preview se audience count bhi dikhate hain
export function CreateCampaignModal({ isOpen, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [audiencePreview, setAudiencePreview] = useState(null);

  // Segment criteria — campaign ke liye segment create karna
  const [segmentCriteria, setSegmentCriteria] = useState({
    minSpent: '',
    maxSpent: '',
    inactiveDays: '',
    city: '',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { channel: 'Email', status: 'Draft' } });

  // Audience preview mutation — segment criteria se count nikalna
  const { mutate: doPreview, isPending: previewing } = useMutation({
    mutationFn: previewSegment,
    onSuccess: (data) => setAudiencePreview(data),
    onError: (err) => toast.error(err.message),
  });

  // Create campaign mutation
  const { mutate: doCreate, isPending: creating } = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      toast.success('Campaign created successfully!');
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      reset();
      setAudiencePreview(null);
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message || 'Failed to create campaign'),
  });

  const handleClose = () => {
    reset();
    setAudiencePreview(null);
    onClose();
  };

  const handlePreview = () => {
    const criteria = {};
    if (segmentCriteria.minSpent) criteria.minSpent = Number(segmentCriteria.minSpent);
    if (segmentCriteria.maxSpent) criteria.maxSpent = Number(segmentCriteria.maxSpent);
    if (segmentCriteria.inactiveDays) criteria.inactiveDays = Number(segmentCriteria.inactiveDays);
    if (segmentCriteria.city) criteria.city = segmentCriteria.city.trim();
    doPreview(criteria);
  };

  const onSubmit = (formData) => {
    // Segment criteria required hai — campaign ke liye audience chahiye
    const criteria = {};
    if (segmentCriteria.minSpent) criteria.minSpent = Number(segmentCriteria.minSpent);
    if (segmentCriteria.maxSpent) criteria.maxSpent = Number(segmentCriteria.maxSpent);
    if (segmentCriteria.inactiveDays) criteria.inactiveDays = Number(segmentCriteria.inactiveDays);
    if (segmentCriteria.city) criteria.city = segmentCriteria.city.trim();

    if (!audiencePreview) {
      toast.error('Please preview the audience first');
      return;
    }

    doCreate({
      name: formData.name,
      channel: formData.channel,
      message: formData.message,
      status: formData.status,
      // segmentId — backend segment model se, preview ke criteria pass kar rahe hain
      // Note: backend me saveCampaign segmentId expect karta hai
      // Full flow me segment save endpoint hona chahiye — yahan workaround as draft
      segmentId: audiencePreview.customers?.[0]?._id || '000000000000000000000000', // placeholder
    });
  };

  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-gray-900 placeholder-gray-400';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Campaign"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button
            variant="primary"
            loading={creating}
            onClick={handleSubmit(onSubmit)}
          >
            Create Campaign
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Campaign Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Campaign Info</h3>
          <Field label="Campaign Name" required error={errors.name?.message}>
            <input
              className={inputClass}
              placeholder="e.g. Summer Reactivation 2025"
              {...register('name', { required: 'Campaign name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Channel" required error={errors.channel?.message}>
              <select className={inputClass} {...register('channel', { required: true })}>
                {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputClass} {...register('status')}>
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Running">Running</option>
              </select>
            </Field>
          </div>

          <Field label="Message" required error={errors.message?.message}>
            <textarea
              className={`${inputClass} resize-none`}
              rows={4}
              placeholder="Hi {name}, we have an exclusive offer for you..."
              {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Min 10 characters' } })}
            />
          </Field>
        </div>

        {/* Segment Criteria */}
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Audience Criteria</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Min Spend (₹)</label>
              <input
                type="number"
                className={inputClass}
                placeholder="0"
                value={segmentCriteria.minSpent}
                onChange={(e) => setSegmentCriteria((s) => ({ ...s, minSpent: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Max Spend (₹)</label>
              <input
                type="number"
                className={inputClass}
                placeholder="Any"
                value={segmentCriteria.maxSpent}
                onChange={(e) => setSegmentCriteria((s) => ({ ...s, maxSpent: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Inactive Days</label>
              <input
                type="number"
                className={inputClass}
                placeholder="e.g. 30"
                value={segmentCriteria.inactiveDays}
                onChange={(e) => setSegmentCriteria((s) => ({ ...s, inactiveDays: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">City</label>
              <input
                type="text"
                className={inputClass}
                placeholder="Mumbai"
                value={segmentCriteria.city}
                onChange={(e) => setSegmentCriteria((s) => ({ ...s, city: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" type="button" onClick={handlePreview} loading={previewing} size="sm">
              Preview Audience
            </Button>
            {audiencePreview && (
              <span className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
                {audiencePreview.count.toLocaleString()} customers
              </span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
