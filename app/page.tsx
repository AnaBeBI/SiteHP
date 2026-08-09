'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SectionId } from '@/lib/data';
import { NAV_ITEMS } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import HomeSection from '@/components/sections/HomeSection';
import FarmaciaSection from '@/components/sections/FarmaciaSection';
import ManuaisSection from '@/components/sections/ManuaisSection';
import GessoSection from '@/components/sections/GessoSection';
import AnimacoesSection from '@/components/sections/AnimacoesSection';
import LaudosSection from '@/components/sections/LaudosSection';
import PsiquiatriaSection from '@/components/sections/PsiquiatriaSection';
import EspecializacoesSection from '@/components/sections/EspecializacoesSection';
import CertificadosSection from '@/components/sections/CertificadosSection';
import UniformesSection from '@/components/sections/UniformesSection';
import VeiculosSection from '@/components/sections/VeiculosSection';
import MapaSection from '@/components/sections/MapaSection';
import PontoSection from '@/components/sections/PontoSection';

type AdminId = 'admin';
type AnySection = SectionId | AdminId;

function SectionContent({ active }: { active: AnySection }) {
  switch (active) {
    case 'home': return <HomeSection />;
    case 'calculadora': return <FarmaciaSection />;
    case 'manuais': return <ManuaisSection />;
    case 'gesso': return <GessoSection />;
    case 'animacoes': return <AnimacoesSection />;
    case 'laudos': return <LaudosSection />;
    case 'psiquiatria': return <PsiquiatriaSection />;
    case 'especializacoes': return <EspecializacoesSection />;
    case 'certificados': return <CertificadosSection />;
    case 'uniformes': return <UniformesSection />;
    case 'veiculos': return <VeiculosSection />;
    case 'mapa': return <MapaSection />;
    case 'ponto': return <PontoSection />;
    default: return <HomeSection />;
  }
}

export default function Page() {
  const [activeSection, setActiveSection] = useState<AnySection>('home');
  const { profile, loading, canAccess, signOut } = useAuth();
  const router = useRouter();

  function navigate(id: AnySection) {
    if (id === 'admin') { router.push('/admin/usuarios'); return; }
    setActiveSection(id);
    document.querySelector('.content')?.scrollTo({ top: 0 });
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 32 }}>🏥</div>
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>Carregando…</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, padding: 24 }}>
        <div style={{ fontSize: 36 }}>⚠️</div>
        <div style={{ fontFamily: '"Fraunces",serif', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Perfil não encontrado</div>
        <div style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center', maxWidth: 380 }}>
          Seu usuário está autenticado, mas o perfil no banco ainda não foi criado.<br />
          Peça ao administrador para verificar o cadastro ou aguarde e tente novamente.
        </div>
        <button
          onClick={signOut}
          style={{ marginTop: 8, padding: '10px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: '"DM Sans",sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          Sair
        </button>
      </div>
    );
  }

  const visibleNav = NAV_ITEMS.filter(item => canAccess(item.id));
  const adminItem = profile?.is_admin
    ? [{ id: 'admin' as const, icon: '⚙️', label: 'Usuários' }]
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
          <SectionContent active={activeSection} />
        </main>
      </div>
    </>
  );
}
