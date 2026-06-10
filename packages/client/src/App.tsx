import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import WorldView from './pages/WorldView';
import MathProblemPage from './pages/MathProblemPage';
import Profile from './pages/Profile';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin-slow">🧮</div>
          <p className="text-gray-500 font-display">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles && user && !roles.includes(user.role)) {
    // Redirect parent to parent dashboard, student to student dashboard
    return <Navigate to={user.role === 'parent' ? '/parent-dashboard' : '/dashboard'} />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-6xl animate-spin-slow">🧮</div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'parent' || user.role === 'teacher' ? '/parent-dashboard' : '/dashboard'} />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

        {/* Student routes */}
        <Route path="/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/world/:worldId" element={<ProtectedRoute roles={['student']}><WorldView /></ProtectedRoute>} />
        <Route path="/world/:worldId/level/:levelId" element={<ProtectedRoute roles={['student']}><MathProblemPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute roles={['student']}><Profile /></ProtectedRoute>} />

        {/* Parent routes */}
        <Route path="/parent-dashboard" element={<ProtectedRoute roles={['parent', 'teacher']}><ParentDashboard /></ProtectedRoute>} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}