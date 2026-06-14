// Reusable Badge component — status display ke liye
const statusStyles = {
  Draft: 'bg-gray-100 text-gray-600',
  Scheduled: 'bg-blue-50 text-blue-600',
  Running: 'bg-green-50 text-green-700',
  Completed: 'bg-purple-50 text-purple-700',
  Failed: 'bg-red-50 text-red-600',
  Active: 'bg-green-50 text-green-700',
  Inactive: 'bg-gray-100 text-gray-500',
  pending: 'bg-yellow-50 text-yellow-700',
  sent: 'bg-blue-50 text-blue-600',
  delivered: 'bg-green-50 text-green-700',
  opened: 'bg-purple-50 text-purple-700',
  clicked: 'bg-indigo-50 text-indigo-700',
  failed: 'bg-red-50 text-red-600',
  converted: 'bg-emerald-50 text-emerald-700',
};

export function Badge({ children, variant }) {
  const style = statusStyles[variant] || statusStyles[children] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style}`}>
      {children}
    </span>
  );
}

// Simple text badge — custom color support
export function Tag({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 ${className}`}>
      {children}
    </span>
  );
}
