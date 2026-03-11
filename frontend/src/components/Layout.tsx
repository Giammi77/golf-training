import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const tabs = [
  { path: '/match', label: 'Match', icon: '⛳' },
  { path: '/history', label: 'Storico', icon: '📋' },
  { path: '/statistics', label: 'Stats', icon: '📊' },
  { path: '/results', label: 'HCP', icon: '🏆' },
];

export default function Layout() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

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
