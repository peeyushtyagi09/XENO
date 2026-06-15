import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { CopilotKit } from '@copilotkit/react-core';
import '@copilotkit/react-ui/styles.css';

import { Layout } from './components/layout/Layout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { CustomersPage } from './features/customers/CustomersPage';
import { SegmentsPage } from './features/segments/SegmentsPage';
import { CampaignsPage } from './features/campaigns/CampaignsPage';
import { AnalyticsPage } from './features/analytics/AnalyticsPage';
import { AICopilot } from './pages/AICopilot';
import { AITestLab } from './pages/AITestLab';

// Get backend API URL from env
const API_URL = import.meta.env.VITE_API_URL;

// TanStack Query client — global config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 seconds tak fresh rahega
      retry: 1,
    },
  },
});

// Main App — router + query provider + layout + CopilotKit
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CopilotKit runtimeUrl={`${API_URL}/api/copilotkit`}>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/segments" element={<SegmentsPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/copilot" element={<AICopilot />} />
              <Route path="/test-lab" element={<AITestLab />} />
            </Routes>
          </Layout>
          {/* Toast notifications — global */}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              },
            }}
          />
        </BrowserRouter>
      </CopilotKit>
    </QueryClientProvider>
  );
}

export default App;