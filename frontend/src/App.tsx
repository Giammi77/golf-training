import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getMe } from '@/api/auth';
import Layout from '@/components/Layout';
import UpdatePrompt from '@/components/UpdatePrompt';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ResetPassword from '@/pages/ResetPassword';
import MatchPage from '@/pages/Match';
import HistoryPage from '@/pages/History';
import StatisticsPage from '@/pages/Statistics';
import ResultsPage from '@/pages/Results';
import ProfilePage from '@/pages/Profile';
import GuidePage from '@/pages/Guide';
import AdminGolfersPage from '@/pages/AdminGolfers';

function useBootstrapUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (isAuthenticated && !user) {
      getMe().then(setUser).catch(() => logout());
    }
  }, [isAuthenticated, user, setUser, logout]);
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user) return null; // wait for user to load
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user) return null; // wait for user to load
  if (!user.is_staff) return <Navigate to="/match" replace />;
  return <>{children}</>;
}

function DefaultRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  const isAdminOnly = user.is_staff && !user.golfer_profile;
  return <Navigate to={isAdminOnly ? '/gestione/giocatori' : '/match'} replace />;
}

export default function App() {
  useBootstrapUser();

  return (
    <>
      <UpdatePrompt />
      <AppRoutes />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DefaultRedirect />} />
        <Route path="match" element={<MatchPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="guide" element={<GuidePage />} />
        <Route
          path="gestione/giocatori"
          element={
            <AdminRoute>
              <AdminGolfersPage />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  );
}
