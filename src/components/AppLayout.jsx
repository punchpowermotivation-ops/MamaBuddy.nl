import { Outlet } from 'react-router-dom';
import TabBar from './TabBar';
import InstallPrompt from './InstallPrompt';

export default function AppLayout() {
  return (
    <>
      <div className="app-shell bg-cream">
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <InstallPrompt />
      <TabBar />
    </>
  );
}
