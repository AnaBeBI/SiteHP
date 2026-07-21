'use client';

import { useState, useMemo } from 'react';

const ANIMACOES = [
  { cat: '/c', cmd: '/c', cls: 'slash', text: 'Em serviço — permite transportar o paciente. <strong>Use com responsabilidade.</strong>' },
  { cat: '/e', cmd: '/e mexer', cls: '', text: 'Animação padrão para manusear o paciente ou objetos.' },
  { cat: '/e', cmd: '/e tablet', cls: '', text: 'Aciona o tablet para analisar exames.' },
  { cat: '/e', cmd: '/e digitar', cls: '', text: 'Manusear aparelhos de exames ou usar o computador para bater o ponto.' },
  { cat: '/e', cmd: '/e atm', cls: '', text: 'Manusear aparelhos de exames.' },
  { cat: '/e', cmd: '/e unhas', cls: '', text: 'Simula levar o paciente na maca ou quando for doar sangue.' },
  { cat: '/e', cmd: '/e mecanico2', cls: '', text: 'Dependendo da situação, usar em vez de <em>/e mexer</em> para pegar algo dentro da ambulância na rua.' },
  { cat: '/e', cmd: '/e mecanico5', cls: '', text: 'Posicionar bolsa de soro no suporte ao lado da maca.' },
  { cat: '/e', cmd: '/e pano', cls: '', text: 'Limpar ferimentos (movimento vertical).' },
  { cat: '/e', cmd: '/e pano2', cls: '', text: 'Limpar ferimentos (movimento horizontal).' },
  { cat: '/e', cmd: '/e café', cls: '', text: 'Pegar o copo de café.' },
  { cat: '/e', cmd: '/e prebeber', cls: '', text: 'Segurar um copo de café para levar ao paciente.' },
  { cat: '/e', cmd: '/e verificar', cls: '', text: 'Fazer primeiros socorros em alguém no chão.' },
  { cat: '/e', cmd: '/e prancheta', cls: '', text: 'Pegar uma prancheta.' },
  { cat: '/e', cmd: '/e anotar', cls: '', text: 'Pegar um bloquinho de notas.' },
  { cat: '/e', cmd: '/e bandeja', cls: '', text: 'Pegar medicação para levar até o paciente.' },
  { cat: '/e', cmd: '/e think2', cls: '', text: 'Animação de "pensando" — usar ao escutar o paciente ou aguardar.' },
  { cat: '/e', cmd: '/e cuidar', cls: '', text: 'Iniciar a massagem de RCP.' },
  { cat: '/e', cmd: '/e cuidar2', cls: '', text: 'Respiração boca a boca na vítima.' },
  { cat: '/e', cmd: '/e caixa3', cls: '', text: 'Caixa de Primeiros Socorros ou Transplante de Órgão.' },
  { cat: '/e', cmd: '/e bolsa5', cls: '', text: 'Caixa térmica do hospital.' },
  { cat: '/e', cmd: '/e ems2', cls: '', text: 'Maleta / bolsa de primeiros socorros.' },
  { cat: '/e', cmd: '/e ems3', cls: '', text: 'Segurar bisturi.' },
  { cat: '/e', cmd: '/e ems4', cls: '', text: 'Segurar bisturi (variação).' },
  { cat: '/e', cmd: '/e ems6', cls: '', text: 'Apontar termômetro — Medindo temperatura no paciente.' },
  { cat: '/e', cmd: '/e mech10', cls: '', text: 'Chave de fenda — usada para apertar curativos.' },
  { cat: '/e', cmd: '/e mech12', cls: '', text: 'Chave inglesa — usada para "apertar" articulações.' },
  { cat: '/e', cmd: '/e mech19', cls: '', text: 'Máquina — usada para retirar o gesso.' },
  { cat: '/e2', cmd: '/e2 cafe2', cls: 'e2', text: 'Faz a pessoa mais próxima tomar o café — no caso, o remédio.' },
  { cat: '/e2', cmd: '/e2 beber8', cls: 'e2', text: 'Faz a pessoa próxima beber em um copo vermelho.' },
  { cat: '/e2', cmd: '/e2 pose41', cls: 'e2', text: 'Coloca o paciente na posição de segurar o algodão na articulação do braço (pós doação de sangue).' },
  { cat: '/e2', cmd: '/e2 pose40', cls: 'e2', text: 'Coloca o paciente na posição de segurar o algodão na articulação do braço (pós doação de sangue).' },
  { cat: '/e2', cmd: '/e2 dormir', cls: 'e2', text: 'Vira o paciente de costas para analisar lesões na coluna.' },
  { cat: '/e2', cmd: '/e2 dormir3', cls: 'e2', text: 'Coloca a vítima de lado — para questões de afogamento.' },
  { cat: '/e2', cmd: '/e2 deitar', cls: 'e2', text: 'Deita o paciente no chão.' },
  { cat: '/e2', cmd: '/e2 sitchair2', cls: 'e2', text: 'Senta o paciente no chão.' },
  { cat: '/e2', cmd: '/e2 sitchair3', cls: 'e2', text: 'Senta o paciente no chão (variação).' },
  { cat: '/e2', cmd: '/e2 sentar2', cls: 'e2', text: 'Senta o paciente no chão.' },
  { cat: '/e2', cmd: '/e2 sentar18', cls: 'e2', text: 'Ajuda o paciente a sentar para doação de sangue.' },
  { cat: 'balao', cmd: '/e2 doe', cls: 'e2', text: 'Entrega um balão com a frase <em>"doe sangue doe vida"</em>.' },
  { cat: 'balao', cmd: '/e2 doe2', cls: 'e2', text: 'Entrega um balão com a frase <em>"sou doador"</em>.' },
  { cat: 'balao', cmd: '/e2 doe3', cls: 'e2', text: 'Entrega um balão com a frase <em>"cada gota importa"</em>.' },
  { cat: 'balao', cmd: '/e2 doe4', cls: 'e2', text: 'Entrega um balão com a frase <em>"você é o tipo certo de alguém"</em>.' },
  { cat: 'repouso', cmd: '/repose ID TEMPO', cls: 'slash', text: 'Coloca o paciente em repouso com gesso. Substitua <strong>ID</strong> pelo ID do jogador e <strong>TEMPO</strong> pela duração.' },
];

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: '/e', label: '/e — Próprias' },
  { id: '/e2', label: '/e2 — No paciente' },
  { id: '/c', label: '/c — Serviço' },
  { id: 'balao', label: 'Balões' },
  { id: 'repouso', label: 'Repouso' },
];

export default function AnimacoesSection() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ANIMACOES.filter((a) => {
      const matchFilter = filter === 'all' || a.cat === filter;
      const matchSearch = !q || a.cmd.toLowerCase().includes(q) || a.text.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [search, filter]);

  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <div className="page-header">
        <h2>Animações 🎬</h2>
        <p>Referência de comandos de animação para uso em serviço</p>
      </div>

      <div className="anim-search">
        <input
          type="text"
          placeholder="Buscar comando ou descrição…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="anim-filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`anim-filter${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="anim-grid">
          {filtered.map((a, i) => (
            <div key={i} className="anim-item">
              <span className={`anim-cmd${a.cls ? ` ${a.cls}` : ''}`}>{a.cmd}</span>
              <div className="anim-text" dangerouslySetInnerHTML={{ __html: a.text }} />
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ color: 'var(--muted)', fontSize: 14, padding: '8px 0' }}>Nenhum resultado encontrado.</p>
          )}
        </div>

        <div className="anim-note">
          <strong>ℹ️ Sobre o /e2:</strong> O <strong>/e2</strong> faz um player próximo realizar uma animação. Ex.:{' '}
          <code>/e2 pose40</code> fará o paciente segurar um algodãozinho no braço após a retirada de sangue.
          <br /><br />
          <span className="warn">⚠️ IMPORTANTE:</span> O uso do <strong>/e2</strong> é{' '}
          <strong>extremamente proibido</strong> para fazer gracinhas ou forçar algum player a realizar qualquer ação constrangedora.
        </div>
      </div>
    </div>
  );
}
