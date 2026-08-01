import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';

const tabs = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10" />
    ),
  },
  {
    to: '/chat',
    label: 'Buddy',
    icon: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
  },
  {
    to: '/mijn-hoofd',
    label: 'Mijn hoofd',
    icon: <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />,
  },
  {
    to: '/profiel',
    label: 'Profiel',
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
      </>
    ),
  },
];

export default function TabBar() {
  // Portaled straight onto <body> so `position: fixed` is always anchored to
  // the real viewport — WebKit/iOS standalone PWAs can otherwise treat
  // `fixed` as relative to a scrollable ancestor, causing the bar to drift.
  return createPortal(
    <div className="fixed left-4 right-4 z-30 bottom-[calc(18px+env(safe-area-inset-bottom))] pointer-events-none">
      <div className="max-w-[420px] mx-auto bg-white/95 backdrop-blur-md border border-line rounded-[26px] shadow-[0_10px_30px_rgba(30,26,24,.14)] flex items-center justify-around px-1.5 py-2 pointer-events-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl flex-1 transition-colors ${
                isActive ? 'text-rose' : 'text-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  stroke="currentColor"
                  fill={isActive ? '#FDE8EE' : 'none'}
                  strokeWidth="1.8"
                >
                  {tab.icon}
                </svg>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>,
    document.body,
  );
}
