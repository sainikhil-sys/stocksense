import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import Landing        from './pages/Landing';
import Login          from './pages/Auth/Login';
import Register       from './pages/Auth/Register';
import Onboarding     from './pages/Onboarding';
import Dashboard      from './pages/Dashboard';
import Budget         from './pages/Budget';
import Goals          from './pages/Goals';
import Portfolio      from './pages/Portfolio';
import Stocks         from './pages/Stocks';
import Simulator      from './pages/Simulator';
import Recommendations from './pages/Recommendations';
import AIChat         from './pages/AIChat';

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function ProfileRoute({ children }) {
  const { isAuthenticated, profileCompleted } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!profileCompleted) return <Navigate to="/onboarding" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, profileCompleted } = useAuthStore();
  if (isAuthenticated) return <Navigate to={profileCompleted ? '/dashboard' : '/onboarding'} replace />;
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Onboarding (auth required, profile not yet done) */}
          <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />

          {/* App (auth + profile required) */}
          <Route element={<ProfileRoute><AppLayout /></ProfileRoute>}>
            <Route path="/dashboard"      element={<Dashboard />} />
            <Route path="/budget"         element={<Budget />} />
            <Route path="/goals"          element={<Goals />} />
            <Route path="/portfolio"      element={<Portfolio />} />
            <Route path="/stocks"         element={<Stocks />} />
            <Route path="/simulator"      element={<Simulator />} />
            <Route path="/recommendations"element={<Recommendations />} />
            <Route path="/ai-chat"        element={<AIChat />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#151d36',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  );
}
