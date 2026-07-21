'use client';

import { useState, useEffect } from 'react';
import { getUniformes, type Uniforme } from '@/lib/queries';

const FILTERS = [
  { id: 'all', label: 'Todos', cls: '' },
  { id: 'int', label: '🏥 Interno', cls: 'f-int' },
  { id: 'esp', label: '🎓 Especialização', cls: 'f-esp' },
  { id: 'ext', label: '🚑 Externo', cls: 'f-ext' },
];

export default function UniformesSection() {
  const [filter, setFilter] = useState('all');
  const [uniformes, setUniformes] = useState<Uniforme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUniformes()
      .then(setUniformes)
      .finally(() => setLoading(false));
  }, []);

  const visible = uniformes.filter((u) => filter === 'all' || u.cat === filter);

  return (
    <div className="page" style={{ maxWidth: 1100 }}>
      <div className="page-header">
        <h2>Uniformes 👔</h2>
        <p>Referência visual de uniformes por cargo</p>
      </div>

      <div className="unif-filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`unif-filter${f.cls ? ` ${f.cls}` : ''}${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          Carregando uniformes…
        </div>
      ) : (
        <div className="unif-grid">
          {visible.map((u) => (
            <div key={u.nome} className="unif-card">
              <div className="unif-card-header" style={{ background: u.bg }}>
                <span className="unif-card-nome">{u.nome}</span>
                <span className={`unif-badge ${u.badge}`}>{u.badgeLabel}</span>
              </div>
              <div className="unif-card-body">
                <div className="unif-chars">
                  <div className="unif-char">
                    <div className="unif-char-label">♀ Feminino</div>
                  </div>
                  <div className="unif-char">
                    <div className="unif-char-label">♂ Masculino</div>
                  </div>
                </div>
                <table className="unif-table">
                  <thead>
                    <tr>
                      <th className="ut-th" />
                      <th className="ut-th">♀ Fem.</th>
                      <th className="ut-th">♂ Masc.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {u.rows.map((row) => (
                      <tr key={row.label}>
                        <td className="ut-label">{row.label}</td>
                        <td className="ut-val" style={row.muted ? { color: 'var(--muted)' } : undefined}>{row.fem}</td>
                        <td className="ut-val" style={row.muted ? { color: 'var(--muted)' } : undefined}>{row.masc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
