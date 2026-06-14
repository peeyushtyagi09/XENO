import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Modal } from '../../components/shared/Modal';
import { Button } from '../../components/ui/Button';
import { createCustomer } from '../../api/customers';

// Form field wrapper — label + input + error display
function Field({ label, error, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Create customer modal — react-hook-form use karke
export function CreateCustomerModal({ isOpen, onClose, onSuccess }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Customer create mutation
  const { mutate, isPending } = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      toast.success('Customer created successfully!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      reset();
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create customer');
    },
  });

  const onSubmit = (data) => mutate(data);

  const handleClose = () => { reset(); onClose(); };

  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-gray-900 placeholder-gray-400';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Customer"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button
            variant="primary"
            loading={isPending}
            onClick={handleSubmit(onSubmit)}
          >
            Create Customer
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Full Name *" error={errors.name?.message}>
          <input
            className={inputClass}
            placeholder="John Doe"
            {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
          />
        </Field>

        <Field label="Email Address *" error={errors.email?.message}>
          <input
            type="email"
            className={inputClass}
            placeholder="john@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
            })}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone" error={errors.phone?.message}>
            <input
              className={inputClass}
              placeholder="+91 9876543210"
              {...register('phone')}
            />
          </Field>

          <Field label="City" error={errors.city?.message}>
            <input
              className={inputClass}
              placeholder="Mumbai"
              {...register('city')}
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
