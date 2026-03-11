import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import MatchPage from '@/pages/Match';
import HistoryPage from '@/pages/History';
import StatisticsPage from '@/pages/Statistics';
import ResultsPage from '@/pages/Results';
import ProfilePage from '@/pages/Profile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/match" replace />} />
        <Route path="match" element={<MatchPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}
