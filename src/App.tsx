import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme } from 'antd';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Consultants } from './pages/Consultants';
import { Trends } from './pages/Trends';

const queryClient = new QueryClient();

function AppContent() {
  const isDark = true;

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#6366f1', // Indigo 500
            colorBgContainer: '#111827',
          },
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}> 
              <Route index element={<Dashboard />} />
              <Route path="trends" element={<Trends />} />
              <Route path="consultants" element={<Consultants />} />
              <Route path="projects" element={<div className="text-white">Projects Page (Coming Soon)</div>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

function App() {
  return <AppContent />;
}

export default App;
