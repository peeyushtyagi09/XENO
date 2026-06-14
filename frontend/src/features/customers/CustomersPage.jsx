import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, MapPin } from 'lucide-react';
import { getCustomers } from '../../api/customers';
import { DataTable, Pagination } from '../../components/shared/DataTable';
import { Button } from '../../components/ui/Button';
import { CustomerDrawer } from './CustomerDrawer';
import { CreateCustomerModal } from './CreateCustomerModal';

// Customer list table — search, city filter, pagination support
export function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  // Customer data fetch karne ke liye query hook
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['customers', { page, search, city }],
    queryFn: () =>
      getCustomers({ page, limit: 10, search, city, sortBy: 'createdAt', sortOrder: 'desc' }),
    keepPreviousData: true,
  });

  const customers = data?.data ?? [];
  const pagination = data?.pagination;

  // Search submit karna
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setCity(cityInput);
    setPage(1);
  };

  // Filters reset karna
  const handleReset = () => {
    setSearch('');
    setCity('');
    setSearchInput('');
    setCityInput('');
    setPage(1);
  };

  // Table columns config
  const columns = [
    {
      key: 'name',
      header: 'Customer',
      render: (name, row) => (
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-400">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (v) => v || '—',
    },
    {
      key: 'city',
      header: 'City',
      render: (v) =>
        v ? (
          <span className="flex items-center gap-1 text-gray-600">
            <MapPin size={12} className="text-gray-400" />
            {v}
          </span>
        ) : '—',
    },
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
    {
      key: 'createdAt',
      header: 'Joined',
      render: (v) => new Date(v).toLocaleDateString('en-IN'),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Customers</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {pagination?.total ?? 0} total customers
          </p>
        </div>
        <Button icon={Plus} onClick={() => setShowCreate(true)}>
          <Plus size={14} />
          Add Customer
        </Button>
      </div>

      {/* Search + Filter bar */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 min-w-[150px]">
          <MapPin size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Filter by city..."
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
          />
        </div>
        <Button type="submit" variant="primary" size="md">Search</Button>
        {(search || city) && (
          <Button type="button" variant="secondary" onClick={handleReset}>Clear</Button>
        )}
      </form>

      {/* Customer Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <DataTable
          columns={columns}
          data={customers}
          loading={isLoading}
          error={error?.message}
          onRetry={refetch}
          onRowClick={setSelectedCustomer}
          emptyTitle="No customers found"
          emptyDescription="Add your first customer or adjust your filters"
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

      {/* Customer Details Drawer */}
      <CustomerDrawer
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />

      {/* Create Customer Modal */}
      <CreateCustomerModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => { setShowCreate(false); refetch(); }}
      />
    </div>
  );
}
