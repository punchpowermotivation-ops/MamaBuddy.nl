import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';

function Splash() {
  return (
    <div className="min-h-svh bg-cream flex items-center justify-center">
      <div className="w-10 h-10 border-[3px] border-rose-light border-t-rose rounded-full animate-spin" />
    </div>
  );
}

function Gate() {
  const { session, profile, loading } = useAuth();

  if (loading) return <Splash />;
  if (!session) return <Welcome />;
  if (!profile?.onboarding_done) return <Onboarding />;
  return <Home />;
}

function RequireOnboardingSession() {
  const { session, loading } = useAuth();
  if (loading) return <Splash />;
  if (!session) return <Navigate to="/" replace />;
  return <Onboarding />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Gate />} />
          <Route path="/onboarding" element={<RequireOnboardingSession />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
