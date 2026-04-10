import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useIsInstalled } from '@/hooks/useIsInstalled';
import InstallHelpModal from './InstallHelpModal';

const DISMISS_KEY = 'install_banner_dismissed';

const baseTabs = [
  { path: '/match', label: 'Match', icon: '⛳' },
  { path: '/history', label: 'Storico', icon: '📋' },
  { path: '/statistics', label: 'Stats', icon: '📊' },
  { path: '/results', label: 'HCP', icon: '🏆' },
];

const adminTab = { path: '/gestione/giocatori', label: 'Admin', icon: '🔧' };

export default function Layout() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const isInstalled = useIsInstalled();
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(
    () => localStorage.getItem(DISMISS_KEY) === '1'
  );

  const dismissBanner = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setBannerDismissed(true);
  };

  const showInstallBanner = !isInstalled && !bannerDismissed;

  const isAdminOnly = user?.is_staff && !user?.golfer_profile;
  const tabs = isAdminOnly
    ? [adminTab]
    : user?.is_staff
      ? [...baseTabs, adminTab]
      : baseTabs;

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-white">
      {/* Header */}
      <header className="bg-golf-green text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold">Golf Training</h1>
        <button
          onClick={() => navigate('/profile')}
          className="text-sm bg-golf-light px-3 py-1 rounded-full"
        >
          {user ? `${user.first_name}` : 'Profilo'}
        </button>
      </header>

      {showInstallBanner && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-3 text-sm">
          <span className="flex-1 text-amber-900">
            📱 Installa l'app sul telefono per usarla meglio
          </span>
          <button
            onClick={() => setShowInstallHelp(true)}
            className="text-golf-green font-semibold"
          >
            Come fare
          </button>
          <button
            onClick={dismissBanner}
            className="text-gray-400 text-lg leading-none"
            aria-label="Chiudi"
          >
            ×
          </button>
        </div>
      )}

      <InstallHelpModal open={showInstallHelp} onClose={() => setShowInstallHelp(false)} />

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-lg mx-auto">
        <div className="flex">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-xs ${
                  isActive
                    ? 'text-golf-green font-semibold'
                    : 'text-gray-500'
                }`
              }
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
