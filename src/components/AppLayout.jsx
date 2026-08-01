import { Outlet } from 'react-router-dom';
import TabBar from './TabBar';
import InstallPrompt from './InstallPrompt';

// Reserved space at the bottom for the floating pill tab bar, so page
// content never renders underneath it: pill (~52px) + its offset from the
// edge (18px) + a little breathing room above the pill.
const TAB_BAR_CLEARANCE = 'pb-[calc(96px+env(safe-area-inset-bottom))]';

export default function AppLayout() {
  return (
    <div className="h-dvh bg-cream relative overflow-hidden">
      <div className={`h-full overflow-y-auto pt-[env(safe-area-inset-top)] ${TAB_BAR_CLEARANCE}`}>
        <Outlet />
      </div>
      <InstallPrompt />
      <TabBar />
    </div>
  );
}
