import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

// Purely decorative — fills the empty gutter beside the framed app card
// on wide desktop windows. Hidden wherever a page already uses the full
// viewport width itself (Landing when logged out, the admin dashboard),
// since there's no real empty space to fill there and the two would
// visually collide.
export default function DesktopMarketingPanel() {
  const { session, loading } = useAuth();
  const location = useLocation();

  const isLoggedOutLanding = location.pathname === '/' && !session && !loading;
  const isAdmin = location.pathname.startsWith('/admin');

  if (isLoggedOutLanding || isAdmin) return null;

  return (
    <div className="desktop-marketing-panel" aria-hidden="true">
      <Logo variant="dark" width={190} className="mb-7" />
      <h2 className="font-serif text-[26px] text-white leading-tight mb-3">
        Jouw persoonlijke Buddy als mama
      </h2>
      <p className="text-[15px] text-white/60 leading-relaxed">
        Voor de momenten dat het zwaar voelt, je hoofd vol zit, en je gewoon even iemand nodig
        hebt die begrijpt wat moederschap echt vraagt.
      </p>
    </div>
  );
}
