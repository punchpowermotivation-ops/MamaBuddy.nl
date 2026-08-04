import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

// Pages that already have their own full-width desktop layout — wrapping
// them in the 420px phone-card would break them, not fix them.
const FULL_WIDTH_PATHS = ['/privacybeleid', '/voorwaarden'];

// Wraps every screen in the desktop split-layout from
// mamabuddy-desktop-layout.html (left brand panel + a centered app
// card on the right). Below 900px .desktop-wrap/.app-panel/.app-card
// are inert (see index.css) so this renders exactly as if it weren't
// here at all — the mobile DOM/behavior is unchanged.
export default function AppFrame({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  const isLoggedOutLanding = location.pathname === '/' && !session && !loading;
  const isAdmin = location.pathname.startsWith('/admin');
  const isFullWidthPage = FULL_WIDTH_PATHS.includes(location.pathname);

  if (isLoggedOutLanding || isAdmin || isFullWidthPage) {
    return children;
  }

  return (
    <div className="desktop-wrap">
      <aside className="brand-panel" aria-hidden="true">
        <div className="brand-logo">
          <Logo variant="dark" width={170} />
        </div>

        <div className="brand-content">
          <h1>
            Jouw persoonlijke Buddy <em>als mama.</em>
          </h1>
          <p>
            Voor de momenten dat het zwaar voelt, je hoofd vol zit, en je gewoon even iemand
            nodig hebt die begrijpt wat moederschap echt vraagt.
          </p>

          <div className="brand-features">
            <div className="brand-feat">
              <div className="brand-feat-icon">💬</div>
              <span>24/7 beschikbaar, altijd iemand die luistert</span>
            </div>
            <div className="brand-feat">
              <div className="brand-feat-icon">🧠</div>
              <span>Onthoudt jouw situatie, geen dossier</span>
            </div>
            <div className="brand-feat">
              <div className="brand-feat-icon">🔒</div>
              <span>Privé & versleuteld, opgeslagen in Europa</span>
            </div>
          </div>
        </div>

        <div className="brand-footer">
          <svg viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          mamabuddy.nl
        </div>
      </aside>

      <main className="app-panel">
        <div className="app-card">{children}</div>
      </main>
    </div>
  );
}
