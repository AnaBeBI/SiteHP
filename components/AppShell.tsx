'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { NAV_ITEMS, type SectionId } from '@/lib/data';

interface AppShellProps {
  children: React.ReactNode;
  activeSection?: string;
}

export default function AppShell({ children, activeSection = '' }: AppShellProps) {
  const { profile, loading, canAccess } = useAuth();
  const router = useRouter();

  function navigate(id: string) {
    if (id === 'admin') { router.push('/admin/usuarios'); return; }
    router.push('/');
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 32 }}>🏥</div>
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>Carregando…</div>
      </div>
    );
  }

  const visibleNav = NAV_ITEMS.filter(item => canAccess(item.id));
  const adminItem = profile?.is_admin
    ? [{ id: 'admin', icon: '⚙️', label: 'Usuários' }]
    : [];

  return (
    <>
      <Header />
      <div className="main">
        <Sidebar
          activeSection={activeSection as SectionId}
          onNavigate={navigate as (id: SectionId) => void}
          visibleItems={[...visibleNav, ...adminItem]}
        />
        <main className="content">
          {children}
        </main>
      </div>
    </>
  );
}
