import { AlertCircle, Inbox } from 'lucide-react';

// Empty state — jab koi data nahi milta
export function EmptyState({ title = 'No data found', description = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-3 bg-gray-100 rounded-full mb-4">
        <Inbox size={24} className="text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {description && <p className="text-xs text-gray-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Error state — API error hone par
export function ErrorState({ message = 'Something went wrong', retry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-3 bg-red-50 rounded-full mb-4">
        <AlertCircle size={24} className="text-red-500" />
      </div>
      <p className="text-sm font-medium text-gray-700">Failed to load data</p>
      <p className="text-xs text-gray-400 mt-1 max-w-xs">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="mt-4 text-xs text-blue-600 hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
