'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const [dark, setDark] = useState(false);
  const { profile, signOut } = useAuth();

  useEffect(() => {
    setDark(document.documentElement.getAttribute('data-theme') === 'dark');
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
  }

  return (
    <header>
      <Image src="/logo.png" alt="Logo Hospital Andrea Silva" className="logo-img" width={52} height={52} />
      <div className="hdiv" />
      <div className="htxt">
        <h1>Hospital Andrea Silva</h1>
        <p>Sistema de Gestão Hospitalar</p>
      </div>
      <div className="header-spacer" />
      {profile && (
        <div className="header-user">
          <span className="header-user-name">{profile.nome}</span>
          <span className="header-user-cargo">{profile.cargo}{profile.especialidade ? ` · ${profile.especialidade}` : ''}</span>
        </div>
      )}
      <button className="theme-btn" onClick={toggle} title={dark ? 'Modo claro' : 'Modo escuro'}>
        {dark ? '☀️' : '🌙'}
      </button>
      {profile && (
        <button className="header-signout" onClick={signOut} title="Sair">
          Sair
        </button>
      )}
    </header>
  );
}
