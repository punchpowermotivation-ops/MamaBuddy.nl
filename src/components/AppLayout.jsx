import { Outlet } from 'react-router-dom';
import TabBar from './TabBar';
import InstallPrompt from './InstallPrompt';

export default function AppLayout() {
  return (
    <div className="h-svh bg-cream flex flex-col relative pt-[env(safe-area-inset-top)]">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <Outlet />
      </div>
      <InstallPrompt />
      <TabBar />
    </div>
  );
}
