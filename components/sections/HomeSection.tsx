'use client';

import { useState } from 'react';

const TABS = [
  { id: 'hierarquia', label: '👩‍⚕️ Hierarquia' },
  { id: 'conduta', label: '📋 Manual de Conduta' },
  { id: 'contrato-hp', label: '📝 Contrato HP' },
];

const HIERARCHY = [
  { icon: '👩‍⚕️', name: 'Antonieta Alencar Santini', role: 'Diretora Geral', badge: 'Diretoria' },
  { icon: '👩‍💼', name: 'Kamila Mar', role: 'Supervisora', badge: 'Supervisão' },
  { icon: '👨‍💼', name: 'Patrick Alencar', role: 'Chefe Externo', badge: 'Chefia' },
  { icon: '👨‍🔧', name: 'Raul Alencar', role: 'Sub-Chefe Externo', badge: 'Sub-Chefia' },
];

export default function HomeSection() {
  const [activeTab, setActiveTab] = useState('hierarquia');

  return (
    <div className="page">
      <div className="page-header">
        <h2>Bem-vindo ao Hospital Andrea Silva</h2>
        <p>Sistema interno de gestão hospitalar</p>
      </div>

      <div className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'hierarquia' && (
        <div className="card">
          <div className="hierarchy">
            {HIERARCHY.map((h) => (
              <div key={h.name} className="hier-item">
                <div className="hier-icon">{h.icon}</div>
                <div className="hier-info">
                  <h3>{h.name}</h3>
                  <p>{h.role}</p>
                </div>
                <span className="hier-badge">{h.badge}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'conduta' && (
        <div className="card">
          <p style={{ marginBottom: 14, fontSize: 14, color: 'var(--muted)' }}>
            Leia e siga o manual de conduta do Hospital Andrea Silva. O cumprimento das normas é obrigatório para todos os membros da equipe.
          </p>
          <a
            href="https://docs.google.com/document/d/1EQxv2a-y0L-MTHlhWN7VHL6CbnLNSXI0HMSbO_MMKIA/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="conduta-link"
          >
            🔗 Abrir em nova aba
          </a>
          <iframe
            className="conduta-frame"
            src="https://docs.google.com/document/d/1EQxv2a-y0L-MTHlhWN7VHL6CbnLNSXI0HMSbO_MMKIA/preview"
            allowFullScreen
          />
        </div>
      )}

      {activeTab === 'contrato-hp' && (
        <div className="card">
          <p style={{ marginBottom: 14, fontSize: 14, color: 'var(--muted)' }}>
            Contrato Hospital Andrea Silva.
          </p>
          <a
            href="https://docs.google.com/document/d/1UbnOAZwZUNC3EZ2ogMlnFBorIXvGskbbzRaNlbnQNbs/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="conduta-link"
          >
            🔗 Abrir em nova aba
          </a>
          <iframe
            className="conduta-frame"
            src="https://docs.google.com/document/d/1UbnOAZwZUNC3EZ2ogMlnFBorIXvGskbbzRaNlbnQNbs/preview"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
