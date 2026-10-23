import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';

const navItems = [
  { to: '/dashboard', label: 'Live Dashboard', icon: '🛰️' },
  { to: '/dashboard/history', label: 'Alert History', icon: '🕓' },
  { to: '/dashboard/demo', label: 'Demo Mode', icon: '🧪' },
];

export function DashboardLayout({ children, liveIndicator }: { children: ReactNode; liveIndicator?: ReactNode }) {
  const { profile, signOut } = useAuth();

  return (
    <div className="flex min-h-screen bg-dash-bg text-white">
      <aside className="hidden w-60 flex-col border-r border-dash-border bg-dash-panel/60 p-4 sm:flex">
        <div className="px-2">
          <Logo size={22} />
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600/20 text-blue-300' : 'text-slate-300 hover:bg-white/5'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-xl bg-black/20 p-3 text-xs">
          <p className="font-semibold">{profile?.name || 'Admin'}</p>
          <p className="text-slate-400">{profile?.role === 'admin' ? 'Monitoring / Admin' : profile?.role}</p>
          <button onClick={() => signOut()} className="mt-2 text-slate-400 hover:text-white">
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-dash-border px-4 py-3 sm:px-6">
          <p className="text-sm font-semibold text-slate-300 sm:hidden">
            <Logo size={18} />
          </p>
          <div className="ml-auto flex items-center gap-3">{liveIndicator}</div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
