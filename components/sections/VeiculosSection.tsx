const VEICULOS = [
  {
    emoji: '🚑',
    bg: 'linear-gradient(135deg,#1E3A8A,#2563EB)',
    nome: 'Ambulância',
    desc: 'Veículo principal para atendimentos de emergência. Usada preferencialmente em atendimentos no <strong>sul da cidade</strong>, com capacidade para transporte de pacientes e equipamentos médicos completos.',
    tags: [
      { label: '🗺️ Sul da cidade', cls: 'tag-info' },
      { label: '🛏️ Transporte permitido', cls: 'tag-ok' },
    ],
    req: 'Curso de Atendimento Externo',
  },
  {
    emoji: '🛻',
    bg: 'linear-gradient(135deg,#1C1917,#44403C)',
    nome: 'Outlaw',
    desc: 'Veículo tático para zonas de alta complexidade. Usada <strong>exclusivamente</strong> no <strong>norte da cidade</strong> em atendimentos de difícil acesso ou elevada complexidade operacional.',
    tags: [
      { label: '🗺️ Norte da cidade', cls: 'tag-info' },
      { label: '🚫 Transporte proibido', cls: 'tag-danger' },
      { label: '⚠️ Alta complexidade', cls: 'tag-warn' },
    ],
    req: 'Curso de Resgate Outlaw',
  },
  {
    emoji: '🏍️',
    bg: 'linear-gradient(135deg,#065F46,#059669)',
    nome: 'Moto',
    desc: 'Veículo ágil para respostas rápidas a emergências. Ideal para deslocamento rápido em situações de urgência onde o tempo de chegada é crítico.',
    tags: [
      { label: '⚡ Resposta rápida', cls: 'tag-ok' },
      { label: '🚫 Transporte proibido', cls: 'tag-danger' },
    ],
    req: 'Curso de MotoMed',
  },
  {
    emoji: '🚁',
    bg: 'linear-gradient(135deg,#6B21A8,#9333EA)',
    nome: 'Helicóptero',
    desc: 'Aeronave para resgates em locais distantes ou de difícil acesso. Utilizado em situações de alta complexidade onde os veículos terrestres não conseguem chegar.',
    tags: [
      { label: '🌍 Resgates distantes', cls: 'tag-info' },
      { label: '⚠️ Alta complexidade', cls: 'tag-warn' },
      { label: '🛏️ Transporte permitido', cls: 'tag-ok' },
    ],
    req: 'Carta de Piloto Hospitalar',
  },
];

export default function VeiculosSection() {
  return (
    <div className="page" style={{ maxWidth: 1000 }}>
      <div className="page-header">
        <h2>Veículos 🚑</h2>
        <p>Frota hospitalar — requisitos, restrições e áreas de atuação</p>
      </div>

      <div className="veiculo-grid">
        {VEICULOS.map((v) => (
          <div key={v.nome} className="veiculo-card">
            <div className="veiculo-banner" style={{ background: v.bg }}>
              {v.emoji}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#ffffff08,transparent)' }} />
            </div>
            <div className="veiculo-body">
              <div className="veiculo-nome">{v.nome}</div>
              <div className="veiculo-desc" dangerouslySetInnerHTML={{ __html: v.desc }} />
              <div className="veiculo-tags">
                {v.tags.map((t) => (
                  <span key={t.label} className={`veiculo-tag ${t.cls}`}>{t.label}</span>
                ))}
              </div>
              <div className="veiculo-req">
                <div className="veiculo-req-icon">📋</div>
                <div className="veiculo-req-text">
                  <strong>Requisito obrigatório</strong>
                  {v.req}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
