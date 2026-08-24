import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-surface">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
          <h1 className="text-sm font-semibold text-ink">{user?.store?.name ?? 'ZetSite'}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-secondary">{user?.email}</span>
            <Button variant="secondary" size="sm" onClick={logout}>
              Log out
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-surface-secondary px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
