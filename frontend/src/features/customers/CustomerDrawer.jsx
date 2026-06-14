import { useQuery } from '@tanstack/react-query';
import { Mail, Phone, MapPin, ShoppingBag, Calendar, IndianRupee } from 'lucide-react';
import { Drawer } from '../../components/shared/Drawer';
import { Skeleton } from '../../components/ui/Skeleton';
import { getCustomerById } from '../../api/customers';

// Info row — label + value pair for customer profile
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="mt-0.5 p-1.5 bg-gray-100 rounded-lg">
        <Icon size={13} className="text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-0.5">{value || '—'}</p>
      </div>
    </div>
  );
}

// Customer detail drawer — customer profile ke saari details
export function CustomerDrawer({ customer, onClose }) {
  // Customer ID se fresh data fetch karna
  const { data, isLoading } = useQuery({
    queryKey: ['customer', customer?._id],
    queryFn: () => getCustomerById(customer._id),
    enabled: !!customer?._id,
  });

  const c = data?.data || customer;

  return (
    <Drawer
      isOpen={!!customer}
      onClose={onClose}
      title="Customer Details"
      size="md"
    >
      {isLoading ? (
        <div className="p-5 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : c ? (
        <div className="p-5">
          {/* Avatar and name */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
              {c.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">{c.name}</h3>
              <p className="text-xs text-gray-400">{c.email}</p>
            </div>
          </div>

          {/* Profile details */}
          <div className="bg-gray-50 rounded-xl px-3 mb-5">
            <InfoRow icon={Mail} label="Email" value={c.email} />
            <InfoRow icon={Phone} label="Phone" value={c.phone || 'Not provided'} />
            <InfoRow icon={MapPin} label="City" value={c.city || 'Not provided'} />
            <InfoRow
              icon={Calendar}
              label="Customer Since"
              value={c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}
            />
            <InfoRow
              icon={Calendar}
              label="Last Order"
              value={c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'No orders yet'}
            />
          </div>

          {/* Spend stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <IndianRupee size={13} className="text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">Total Spend</span>
              </div>
              <p className="text-xl font-bold text-blue-700">
                ₹{(c.totalSpent || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <ShoppingBag size={13} className="text-purple-600" />
                <span className="text-xs text-purple-600 font-medium">Customer ID</span>
              </div>
              <p className="text-xs font-mono font-medium text-purple-700 break-all">
                {c._id?.slice(-8)}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}
