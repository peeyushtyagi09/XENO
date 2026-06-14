import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';

// Route mapping for breadcrumb display
const routeLabels = {
  '/': 'Dashboard',
  '/customers': 'Customers',
  '/segments': 'Segments',
  '/campaigns': 'Campaigns',
  '/analytics': 'Analytics',
  '/copilot': 'AI Copilot',
  '/test-lab': 'AI Test Lab',
};

// Top navigation bar — page title aur breadcrumb dikhata hai
export function Topbar() {
  const { pathname } = useLocation();
  const label = routeLabels[pathname] || 'XENO CRM';

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-60 z-30 h-14 bg-white border-b border-gray-200 flex items-center px-6">
      {/* Left — page title */}
      <div className="flex-1 pl-10 lg:pl-0">
        <h1 className="text-sm font-semibold text-gray-900">{label}</h1>
        <p className="text-xs text-gray-400">
          {pathname === '/' ? 'Overview of your CRM' : `Manage ${label.toLowerCase()}`}
        </p>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
        </button>
        {/* User avatar placeholder */}
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
          X
        </div>
      </div>
    </header>
  );
}
