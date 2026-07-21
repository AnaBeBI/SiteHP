'use client';

import { useState, useEffect } from 'react';
import { getCursos, type Curso } from '@/lib/queries';

export default function ManuaisSection() {
  const [cursos, setCursos] = useState<Curso[]>([]);

  useEffect(() => {
    getCursos().then(all => {
      const seen = new Map<string, Curso>();
      all.forEach(c => {
        const existing = seen.get(c.nome);
        if (!existing || (c.link && !existing.link)) seen.set(c.nome, c);
      });
      const sorted = Array.from(seen.values()).sort((a, b) => a.nome.localeCompare(b.nome));
      setCursos(sorted);
    });
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Manuais de Cursos 📚</h2>
        <p>Materiais de estudo organizados por curso</p>
      </div>
      <div className="card">
        <div className="manual-grid">
          {cursos.map((c) => (
            <div key={c.nome} className="manual-item">
              <div className={`manual-dot${c.link ? '' : ' no-link'}`} />
              {c.link ? (
                <a href={c.link} target="_blank" rel="noopener noreferrer">
                  {c.nome}
                </a>
              ) : (
                <span>{c.nome}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
