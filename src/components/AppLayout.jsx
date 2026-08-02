import { Outlet } from 'react-router-dom';
import TabBar from './TabBar';
import InstallPrompt from './InstallPrompt';

export default function AppLayout() {
  return (
    <div className="app-shell bg-cream">
      <main className="flex-1 min-h-0 overflow-y-auto [-webkit-overflow-scrolling:touch] pt-[env(safe-area-inset-top)]">
        <Outlet />
      </main>
      <InstallPrompt />
      <TabBar />
    </div>
  );
}
