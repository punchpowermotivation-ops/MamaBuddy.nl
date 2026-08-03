import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Chat from './pages/Chat';
import MentalLoad from './pages/MentalLoad';
import Profile from './pages/Profile';
import CheckIn from './pages/CheckIn';
import AppLayout from './components/AppLayout';

function Splash() {
  return (
    <div className="min-h-svh bg-cream flex items-center justify-center">
      <div className="w-10 h-10 border-[3px] border-rose-light border-t-rose rounded-full animate-spin" />
    </div>
  );
}

function AppGate({ children }) {
  const { session, profile, loading } = useAuth();

  if (loading) return <Splash />;
  if (!session) return <Landing />;
  if (!profile?.onboarding_done) return <Onboarding />;
  return children;
}

function RequireOnboardingSession() {
  const { session, loading } = useAuth();
  if (loading) return <Splash />;
  if (!session) return <Navigate to="/" replace />;
  return <Onboarding />;
}

function WelcomeRoute() {
  const { session, loading } = useAuth();
  if (loading) return <Splash />;
  if (session) return <Navigate to="/" replace />;
  return <Welcome />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <AppGate>
                <AppLayout />
              </AppGate>
            }
          >
            <Route index element={<Home />} />
            <Route path="mijn-hoofd" element={<MentalLoad />} />
            <Route path="profiel" element={<Profile />} />
          </Route>
          {/* Chat and check-in are full-screen routes without the tab bar,
              like a native chat app: open one and the tab bar disappears,
              back arrow returns you to the tabbed app. */}
          <Route
            path="/chat"
            element={
              <AppGate>
                <Chat />
              </AppGate>
            }
          />
          <Route
            path="/check-in"
            element={
              <AppGate>
                <CheckIn />
              </AppGate>
            }
          />
          <Route path="/onboarding" element={<RequireOnboardingSession />} />
          <Route path="/welkom" element={<WelcomeRoute />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
