'use client';

import { useState, useEffect, useMemo } from 'react';
import { getCargosMapa, getCursos, getCargoProgressao, buildCoursesFor } from '@/lib/queries';
import type { CargoMapa, Curso, CargoProgressao } from '@/lib/queries';

export default function MapaSection() {
  const [active, setActive] = useState<string | null>(null);
  const [cargosMapa, setCargosMapa] = useState<CargoMapa[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [progressao, setProgressao] = useState<CargoProgressao[]>([]);

  useEffect(() => {
    Promise.all([getCargosMapa(), getCursos(), getCargoProgressao()])
      .then(([cargos, c, prog]) => {
        setCargosMapa(cargos);
        setCursos(c);
        setProgressao(prog);
      });
  }, []);

  const dataMap = useMemo(
    () => Object.fromEntries(cargosMapa.map(c => [c.id, c])),
    [cargosMapa]
  );

  const data: CargoMapa | null = active ? (dataMap[active] ?? null) : null;
  const courses = active ? buildCoursesFor(active, progressao, cursos) : [];

  return (
    <div className="map-wrap">
      <div className="map-flow-panel">
        <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
            <div style={{ width: 28, height: 8, borderRadius: 4, background: 'linear-gradient(90deg,#6C63D8,#4035A8)' }} />Obrigatório
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
            <div style={{ width: 28, height: 8, borderRadius: 4, background: 'linear-gradient(90deg,#5C8FE8,#185FA5)' }} />Interno
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
            <div style={{ width: 28, height: 8, borderRadius: 4, background: 'linear-gradient(90deg,#E87040,#A83010)' }} />Externo
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>Clique em um cargo para ver detalhes →</div>
        </div>

        <svg className="map-svg" viewBox="0 0 1190 466" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g-obrig" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7B72E9"/><stop offset="100%" stopColor="#4035A8"/>
            </linearGradient>
            <linearGradient id="g-tec" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8880F0"/><stop offset="100%" stopColor="#534AB7"/>
            </linearGradient>
            <linearGradient id="g-dec" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F5A623"/><stop offset="100%" stopColor="#C07A00"/>
            </linearGradient>
            <linearGradient id="g-int" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4E9AEB"/><stop offset="100%" stopColor="#1350A0"/>
            </linearGradient>
            <linearGradient id="g-int-top" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#1040A0"/>
            </linearGradient>
            <linearGradient id="g-ext" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E87040"/><stop offset="100%" stopColor="#9A2E10"/>
            </linearGradient>
            <linearGradient id="g-samu" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C0392B"/><stop offset="100%" stopColor="#7B1010"/>
            </linearGradient>
            <filter id="sh" x="-8%" y="-8%" width="120%" height="130%">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#00000025"/>
            </filter>
            <filter id="sh2" x="-8%" y="-8%" width="120%" height="135%">
              <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#00000035"/>
            </filter>
            <marker id="arr-p" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M1 2L9 5L1 8" fill="#534AB7"/>
            </marker>
            <marker id="arr-o" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M1 2L9 5L1 8" fill="#D85A30"/>
            </marker>
            <marker id="arr-g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M1 2L9 5L1 8" fill="#C07A00"/>
            </marker>
          </defs>

          <rect x="0" y="0" width="1190" height="466" fill="#F4F2EF"/>

          <rect x="518" y="34" width="500" height="122" rx="16" fill="#EEF2FF" opacity=".8"/>
          <text x="530" y="48" fontFamily="DM Sans,sans-serif" fontSize="10" fontWeight="700" fill="#534AB7" letterSpacing="1.5">CAMINHO INTERNO</text>

          <rect x="518" y="302" width="664" height="122" rx="16" fill="#FFF0EB" opacity=".8"/>
          <text x="530" y="316" fontFamily="DM Sans,sans-serif" fontSize="10" fontWeight="700" fill="#D85A30" letterSpacing="1.5">CAMINHO EXTERNO</text>

          {/* Arrows */}
          <line x1="168" y1="240" x2="184" y2="240" stroke="#534AB7" strokeWidth="2.5" strokeDasharray="6,3" markerEnd="url(#arr-p)"/>
          <line x1="332" y1="240" x2="348" y2="240" stroke="#534AB7" strokeWidth="2.5" markerEnd="url(#arr-p)"/>
          <path d="M422 197 L422 95 L530 95" fill="none" stroke="#534AB7" strokeWidth="2.5" markerEnd="url(#arr-p)"/>
          <path d="M422 283 L422 363 L530 363" fill="none" stroke="#D85A30" strokeWidth="2.5" markerEnd="url(#arr-o)"/>
          <line x1="678" y1="95" x2="694" y2="95" stroke="#534AB7" strokeWidth="2.5" markerEnd="url(#arr-p)"/>
          <line x1="842" y1="95" x2="858" y2="95" stroke="#534AB7" strokeWidth="2.5" markerEnd="url(#arr-p)"/>
          <line x1="678" y1="363" x2="694" y2="363" stroke="#D85A30" strokeWidth="2.5" markerEnd="url(#arr-o)"/>
          <line x1="842" y1="363" x2="858" y2="363" stroke="#D85A30" strokeWidth="2.5" markerEnd="url(#arr-o)"/>
          <line x1="1006" y1="363" x2="1022" y2="363" stroke="#D85A30" strokeWidth="2.5" markerEnd="url(#arr-o)"/>

          {/* Estagiário */}
          <g className={`map-ng${active === 'estagiario' ? ' active' : ''}`} onClick={() => setActive('estagiario')} filter="url(#sh)">
            <rect className="node-card" x="20" y="197" width="148" height="86" rx="14" fill="url(#g-obrig)"/>
            <rect x="20" y="197" width="5" height="86" rx="3" fill="#ffffff40"/>
            <text x="94" y="223" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="13" fontWeight="700" fill="#fff">Estagiário</text>
            <text x="94" y="239" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#ffffffbb">Cargo inicial</text>
            <rect x="52" y="251" width="84" height="20" rx="10" fill="#ffffff22"/>
            <text x="94" y="265" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fontWeight="600" fill="#fff">R$ 1.500/mês</text>
            <circle cx="34" cy="189" r="9" fill="#534AB7" stroke="#F4F2EF" strokeWidth="2"/>
            <text x="34" y="193" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="9" fontWeight="700" fill="#fff">1</text>
          </g>

          {/* Téc. Enfermagem */}
          <g className={`map-ng${active === 'tec' ? ' active' : ''}`} onClick={() => setActive('tec')} filter="url(#sh)">
            <rect className="node-card" x="184" y="197" width="148" height="86" rx="14" fill="url(#g-tec)"/>
            <rect x="184" y="197" width="5" height="86" rx="3" fill="#ffffff40"/>
            <text x="258" y="221" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="12" fontWeight="700" fill="#fff">Téc.</text>
            <text x="258" y="235" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="12" fontWeight="700" fill="#fff">Enfermagem</text>
            <rect x="216" y="251" width="84" height="20" rx="10" fill="#ffffff22"/>
            <text x="258" y="265" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fontWeight="600" fill="#fff">R$ 2.000/mês</text>
            <circle cx="198" cy="189" r="9" fill="#534AB7" stroke="#F4F2EF" strokeWidth="2"/>
            <text x="198" y="193" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="9" fontWeight="700" fill="#fff">2</text>
          </g>

          {/* Decisão */}
          <g className={`map-ng${active === 'decisao' ? ' active' : ''}`} onClick={() => setActive('decisao')} filter="url(#sh)">
            <rect className="node-card" x="348" y="197" width="148" height="86" rx="14" fill="url(#g-dec)"/>
            <rect x="348" y="197" width="5" height="86" rx="3" fill="#ffffff40"/>
            <text x="422" y="223" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="13" fontWeight="700" fill="#fff">Escolher</text>
            <text x="422" y="239" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="13" fontWeight="700" fill="#fff">Caminho</text>
            <text x="422" y="257" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#ffffffbb">Interno ou Externo</text>
            <circle cx="362" cy="189" r="9" fill="#C07A00" stroke="#F4F2EF" strokeWidth="2"/>
            <text x="362" y="193" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="9" fontWeight="700" fill="#fff">3</text>
          </g>

          {/* Enfermeiro */}
          <g className={`map-ng${active === 'enfermeiro' ? ' active' : ''}`} onClick={() => setActive('enfermeiro')} filter="url(#sh)">
            <rect className="node-card" x="530" y="52" width="148" height="86" rx="14" fill="url(#g-int)"/>
            <rect x="530" y="52" width="5" height="86" rx="3" fill="#ffffff40"/>
            <text x="604" y="78" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="13" fontWeight="700" fill="#fff">Enfermeiro</text>
            <text x="604" y="93" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#ffffffbb">Interno</text>
            <rect x="562" y="105" width="84" height="20" rx="10" fill="#ffffff22"/>
            <text x="604" y="119" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fontWeight="600" fill="#fff">R$ 2.500/mês</text>
          </g>

          {/* Residente */}
          <g className={`map-ng${active === 'residente' ? ' active' : ''}`} onClick={() => setActive('residente')} filter="url(#sh)">
            <rect className="node-card" x="694" y="52" width="148" height="86" rx="14" fill="url(#g-int)"/>
            <rect x="694" y="52" width="5" height="86" rx="3" fill="#ffffff40"/>
            <text x="768" y="78" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="13" fontWeight="700" fill="#fff">Residente</text>
            <text x="768" y="93" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#ffffffbb">🎓 Especialização</text>
            <rect x="726" y="105" width="84" height="20" rx="10" fill="#ffffff22"/>
            <text x="768" y="119" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fontWeight="600" fill="#fff">R$ 3.000/mês</text>
          </g>

          {/* Médico */}
          <g className={`map-ng${active === 'medico' ? ' active' : ''}`} onClick={() => setActive('medico')} filter="url(#sh2)">
            <rect className="node-card" x="858" y="52" width="148" height="86" rx="14" fill="url(#g-int-top)"/>
            <rect x="858" y="52" width="5" height="86" rx="3" fill="#ffffff40"/>
            <text x="932" y="74" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="13" fontWeight="700" fill="#fff">Médico</text>
            <text x="932" y="88" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#ffffffbb">★ Topo Interno</text>
            <rect x="890" y="102" width="84" height="20" rx="10" fill="#ffffff22"/>
            <text x="932" y="116" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fontWeight="600" fill="#fff">R$ 3.500/mês</text>
          </g>

          {/* Socorrista */}
          <g className={`map-ng${active === 'socorrista' ? ' active' : ''}`} onClick={() => setActive('socorrista')} filter="url(#sh)">
            <rect className="node-card" x="530" y="320" width="148" height="86" rx="14" fill="url(#g-ext)"/>
            <rect x="530" y="320" width="5" height="86" rx="3" fill="#ffffff40"/>
            <text x="604" y="346" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="13" fontWeight="700" fill="#fff">Socorrista</text>
            <text x="604" y="361" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#ffffffbb">🚑 Externo</text>
            <rect x="562" y="373" width="84" height="20" rx="10" fill="#ffffff22"/>
            <text x="604" y="387" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fontWeight="600" fill="#fff">R$ 2.000/mês</text>
          </g>

          {/* Paramédico */}
          <g className={`map-ng${active === 'paramedico' ? ' active' : ''}`} onClick={() => setActive('paramedico')} filter="url(#sh)">
            <rect className="node-card" x="694" y="320" width="148" height="86" rx="14" fill="url(#g-ext)"/>
            <rect x="694" y="320" width="5" height="86" rx="3" fill="#ffffff40"/>
            <text x="768" y="346" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="13" fontWeight="700" fill="#fff">Paramédico</text>
            <text x="768" y="361" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#ffffffbb">Suporte avançado</text>
            <rect x="726" y="373" width="84" height="20" rx="10" fill="#ffffff22"/>
            <text x="768" y="387" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fontWeight="600" fill="#fff">R$ 2.500/mês</text>
          </g>

          {/* Resgatista */}
          <g className={`map-ng${active === 'resgatista' ? ' active' : ''}`} onClick={() => setActive('resgatista')} filter="url(#sh)">
            <rect className="node-card" x="858" y="320" width="148" height="86" rx="14" fill="url(#g-ext)"/>
            <rect x="858" y="320" width="5" height="86" rx="3" fill="#ffffff40"/>
            <text x="932" y="346" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="13" fontWeight="700" fill="#fff">Resgatista</text>
            <text x="932" y="361" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#ffffffbb">Campo e urgências</text>
            <rect x="890" y="373" width="84" height="20" rx="10" fill="#ffffff22"/>
            <text x="932" y="387" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fontWeight="600" fill="#fff">R$ 3.000/mês</text>
          </g>

          {/* Médico SAMU */}
          <g className={`map-ng${active === 'samu' ? ' active' : ''}`} onClick={() => setActive('samu')} filter="url(#sh2)">
            <rect className="node-card" x="1022" y="320" width="148" height="86" rx="14" fill="url(#g-samu)"/>
            <rect x="1022" y="320" width="5" height="86" rx="3" fill="#ffffff40"/>
            <text x="1096" y="342" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="12" fontWeight="700" fill="#fff">Médico SAMU</text>
            <text x="1096" y="356" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#ffffffbb">★ Topo Externo</text>
            <rect x="1054" y="370" width="84" height="20" rx="10" fill="#ffffff22"/>
            <text x="1096" y="384" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fontWeight="600" fill="#fff">R$ 3.500/mês</text>
          </g>
        </svg>
      </div>

      {/* Sidebar */}
      <div className="map-sidebar">
        {!active || !data ? (
          <div className="map-sb-empty" id="map-empty">
            <div className="em-ico">🩺</div>
            <p>Clique em qualquer cargo no fluxograma para ver remuneração e cursos obrigatórios.</p>
          </div>
        ) : (
          <div className="map-sb-content vis" id="map-sb">
            <div className="map-sb-head">
              <div className={`map-sb-badge ${data.badge_classe}`}>{data.badge_label}</div>
              <h2>{data.titulo}</h2>
              <div className="sub">{data.subtitulo}</div>
            </div>

            {data.salario !== '-' && (
              <div className="map-sal-hero">
                <div>
                  <div className="lbl">Salário base</div>
                  <div className="val">{data.salario}</div>
                  <div className="ex">+ adicional por cursos concluídos</div>
                </div>
                <div className="map-sal-ico">💰</div>
              </div>
            )}

            <div className="map-sb-body">
              <div className="map-sec">
                <h3>Sobre o cargo</h3>
                <p>{data.descricao}</p>
              </div>

              {courses.length > 0 && (
                <div className="map-sec" id="map-courses-sec">
                  <h3>
                    Cursos necessários{' '}
                    <span style={{ fontSize: 10, fontWeight: 400, letterSpacing: 0, textTransform: 'none', color: 'var(--muted)' }}>
                      (acumulativos por nível)
                    </span>
                  </h3>
                  <div className="map-course-list">
                    {courses.map((c, i) => (
                      <div key={i} className={`map-ci ${c.isNew ? 'new' : 'old'}`}>
                        <div className={`map-ci-dot ${c.isNew ? 'map-dot-new' : 'map-dot-old'}`} />
                        <div className="map-ci-info">
                          {c.link ? (
                            <a href={c.link} target="_blank" rel="noopener noreferrer" className="map-ci-name">{c.n}</a>
                          ) : (
                            <span className="map-ci-name">{c.n}</span>
                          )}
                          <span className={`map-ci-label ${c.isNew ? 'map-lbl-new' : 'map-lbl-old'}`}>
                            {c.isNew ? 'Novo neste cargo' : 'Cargo anterior'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="map-sb-foot" dangerouslySetInnerHTML={{ __html: data.proximo_passo }} />
          </div>
        )}
      </div>
    </div>
  );
}
