import { Outlet } from 'react-router-dom';
import TabBar from './TabBar';
import InstallPrompt from './InstallPrompt';

export default function AppLayout() {
  return (
    <div className="full-bleed-min-height bg-cream flex flex-col relative">
      <div className="flex-1 min-h-0 overflow-y-auto pt-[env(safe-area-inset-top)]">
        <Outlet />
      </div>
      <InstallPrompt />
      <TabBar />
    </div>
  );
}
