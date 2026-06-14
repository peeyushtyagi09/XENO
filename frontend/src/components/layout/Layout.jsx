import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

// Main layout wrapper — sidebar + topbar + content area
export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      {/* Topbar */}
      <Topbar />
      {/* Main content — sidebar width offset + topbar height offset */}
      <main className="lg:ml-60 pt-14">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
