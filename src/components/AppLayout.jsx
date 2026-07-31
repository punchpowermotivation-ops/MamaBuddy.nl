import { Outlet } from 'react-router-dom';
import TabBar from './TabBar';
import InstallPrompt from './InstallPrompt';

export default function AppLayout() {
  return (
    <div className="min-h-svh bg-cream flex flex-col relative">
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
      <InstallPrompt />
      <TabBar />
    </div>
  );
}
