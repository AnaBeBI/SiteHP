'use client';

import { useState } from 'react';

const MASCULINO = [
  { icon: '💪', label: 'Braço Esquerdo', name: 'Colete', code: 'Nº 56' },
  { icon: '💪', label: 'Braço Direito', name: 'Colete', code: 'Nº 55' },
  { icon: '🦵', label: 'Perna Esquerda', name: 'Camisa', code: 'Nº 216' },
  { icon: '🦵', label: 'Perna Direita', name: 'Camisa', code: 'Nº 217' },
  { icon: '🧥', label: 'Tórax', name: 'Jaqueta', code: 'Nº 548' },
  { icon: '🔘', label: 'Pescoço', name: 'Acessório', code: 'Nº 200' },
  { icon: '👟', label: 'Pés', name: 'Camisa', code: 'Nº 221' },
];

const FEMININO = [
  { icon: '💪', label: 'Braço Esquerdo', name: 'Colete', code: 'Nº 54' },
  { icon: '💪', label: 'Braço Direito', name: 'Colete', code: 'Nº 55' },
  { icon: '🦵', label: 'Perna Esquerda', name: 'Camisa', code: 'Nº 270' },
  { icon: '🦵', label: 'Perna Direita', name: 'Camisa', code: 'Nº 269' },
  { icon: '🔘', label: 'Pescoço', name: 'Acessório', code: 'Nº 167' },
  { icon: '👠', label: 'Pés', name: 'Sapato', code: 'Nº 150' },
];

export default function GessoSection() {
  const [tab, setTab] = useState<'masculino' | 'feminino'>('masculino');
  const items = tab === 'masculino' ? MASCULINO : FEMININO;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Roupas de Gesso 🩹</h2>
        <p>Itens de vestuário utilizados nos procedimentos de imobilização</p>
      </div>
      <div className="card">
        <div className="gesso-tabs">
          <button
            className={`gesso-tab${tab === 'masculino' ? ' active' : ''}`}
            onClick={() => setTab('masculino')}
          >
            ♂ Masculino
          </button>
          <button
            className={`gesso-tab${tab === 'feminino' ? ' active' : ''}`}
            onClick={() => setTab('feminino')}
          >
            ♀ Feminino
          </button>
        </div>
        <div className="gesso-panel active">
          {items.map((item) => (
            <div key={`${item.label}-${item.code}`} className="gesso-card">
              <div className="gesso-part-icon">{item.icon}</div>
              <div className="gesso-info">
                <div className="part-label">{item.label}</div>
                <div className="part-name">{item.name}</div>
                <span className="part-code">{item.code}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
