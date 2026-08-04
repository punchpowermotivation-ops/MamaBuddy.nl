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
import Toeslagen from './pages/Toeslagen';
import Admin from './pages/Admin';
import Meldingen from './pages/Meldingen';
import PrivacyData from './pages/PrivacyData';
import HulpContact from './pages/HulpContact';
import Privacybeleid from './pages/Privacybeleid';
import Voorwaarden from './pages/Voorwaarden';
import AppLayout from './components/AppLayout';
import DesktopMarketingPanel from './components/DesktopMarketingPanel';
import { ADMIN_EMAIL } from './lib/constants';

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

function AdminGate() {
  const { session, loading } = useAuth();
  if (loading) return <Splash />;
  if (!session) return <Navigate to="/welkom" replace />;
  if (session.user.email?.toLowerCase() !== ADMIN_EMAIL) return <Navigate to="/" replace />;
  return <Admin />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DesktopMarketingPanel />
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
          <Route
            path="/toeslagen"
            element={
              <AppGate>
                <Toeslagen />
              </AppGate>
            }
          />
          <Route
            path="/meldingen"
            element={
              <AppGate>
                <Meldingen />
              </AppGate>
            }
          />
          <Route
            path="/privacy-data"
            element={
              <AppGate>
                <PrivacyData />
              </AppGate>
            }
          />
          <Route
            path="/hulp-contact"
            element={
              <AppGate>
                <HulpContact />
              </AppGate>
            }
          />
          <Route path="/onboarding" element={<RequireOnboardingSession />} />
          <Route path="/welkom" element={<WelcomeRoute />} />
          <Route path="/admin" element={<AdminGate />} />
          {/* Publieke juridische pagina's — altijd bereikbaar, ook uitgelogd. */}
          <Route path="/privacybeleid" element={<Privacybeleid />} />
          <Route path="/voorwaarden" element={<Voorwaarden />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
