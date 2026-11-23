
import { Navigate, Route, Routes } from 'react-router-dom';

import Dashboard from './Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#11121b]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-100/20 border-t-indigo-500" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
      </Route>

      {/* Unknown routes */}
      <Route
        path="*"
        element={
          loading ? null : (
            <Navigate to={isAuthenticated ? '/' : '/login'} replace />
          )
        }
      />
    </Routes>
  );
}
