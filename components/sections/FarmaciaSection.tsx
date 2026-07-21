'use client';

import { useState, useEffect } from 'react';
import { getProdutos, getMateriais, getReceitas } from '@/lib/queries';

const BOLSA_CAP = 10;
const BOLSA_PRECO = 100;
const DESCONTO = 0.1;
const BOLSA_ITENS = [
  { id: 'analgesico',  nome: 'Analgésico',  peso: 0.10, preco:  200 },
  { id: 'bandagem',    nome: 'Bandagem',     peso: 0.10, preco:  500 },
  { id: 'gaze',        nome: 'Gaze',         peso: 0.07, preco:  250 },
  { id: 'kit',         nome: 'Kit Médico',   peso: 0.45, preco: 1350 },
  { id: 'ritmoneury',  nome: 'Ritmoneury',   peso: 0.25, preco:  925 },
  { id: 'sinkalmy',    nome: 'Sinkalmy',     peso: 0.25, preco:  750 },
];

type Produto = { id: string; nome: string; preco: number };
type Material = { id: string; label: string };
type Receita = { id: number; nome: string; emoji: string; ingredientes: Record<string, number> };

function spawnStars(x: number, y: number, n: number) {
  const emojis = ['✨', '💖', '🌟', '🌸'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('div');
    s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    s.className = 'calc-star';
    s.style.left = (x - 10) + 'px';
    s.style.top = (y - 10) + 'px';
    const ang = Math.random() * Math.PI * 2;
    const dist = Math.random() * 100 + 40;
    s.style.setProperty('--tx', Math.cos(ang) * dist + 'px');
    s.style.setProperty('--ty', Math.sin(ang) * dist + 'px');
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 800);
  }
}

function precoFinal(preco: number, promo: boolean) {
  return promo ? preco * (1 - DESCONTO) : preco;
}

function VendasTab({ promo, produtos }: { promo: boolean; produtos: Produto[] }) {
  const [qtds, setQtds] = useState<Record<string, number>>({});

  const total = produtos.reduce((acc, p) => acc + (qtds[p.id] || 0) * precoFinal(p.preco, promo), 0);

  function handleZerar(e: React.MouseEvent) {
    setQtds(Object.fromEntries(produtos.map((p) => [p.id, 0])));
    spawnStars(e.clientX, e.clientY, 14);
  }

  return (
    <div className="farma-panel active">
      <table className="calc-table">
        <thead>
          <tr>
            <th className="calc-th">Produto</th>
            <th className="calc-th">Preço Un.</th>
            <th className="calc-th">Qtd.</th>
            <th className="calc-th">Total</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p) => {
            const pUnit = precoFinal(p.preco, promo);
            return (
              <tr key={p.id}>
                <td className="calc-td product-name">{p.nome}</td>
                <td className="calc-td">
                  {promo && (
                    <span className="preco-original">$ {p.preco.toLocaleString('pt-BR')}</span>
                  )}
                  <span className={promo ? 'preco-promo' : ''}>$ {pUnit.toLocaleString('pt-BR')}</span>
                </td>
                <td className="calc-td">
                  <input
                    type="number"
                    className="calc-input"
                    min={0}
                    value={qtds[p.id] ?? 0}
                    onChange={(e) => setQtds((q) => ({ ...q, [p.id]: parseFloat(e.target.value) || 0 }))}
                  />
                </td>
                <td className="calc-td" style={{ fontWeight: 700 }}>
                  $ {((qtds[p.id] || 0) * pUnit).toLocaleString('pt-BR')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="calc-actions">
        <button type="button" className="btn-zerar" onClick={handleZerar}>Zerar 🗑️</button>
        <div className="calc-total-box">Total: $ {total.toLocaleString('pt-BR')}</div>
      </div>
    </div>
  );
}

function ProducaoTab({ materiais, receitas }: { materiais: Material[]; receitas: Receita[] }) {
  const [mats, setMats] = useState<Record<string, number>>({});

  function handleZerar(e: React.MouseEvent) {
    setMats(Object.fromEntries(materiais.map((m) => [m.id, 0])));
    spawnStars(e.clientX, e.clientY, 10);
  }

  const receitasCalc = receitas.map((r) => {
    const ings = Object.entries(r.ingredientes) as [string, number][];
    const podeProds = ings.map(([key, qtd]) => Math.floor((mats[key] || 0) / qtd));
    const maxProd = podeProds.length > 0 ? Math.min(...podeProds) : 0;
    return { ...r, ings, maxProd };
  });

  return (
    <div className="farma-panel active">
      <div className="prod-header-row">
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
          Informe a quantidade de cada material — a tabela atualiza automaticamente.
        </p>
        <button type="button" className="prod-btn-zerar" onClick={handleZerar}>Zerar 🗑️</button>
      </div>

      <div className="prod-materials-grid">
        {materiais.map((m) => (
          <div key={m.id} className="prod-mat-card">
            <label htmlFor={`mat-${m.id}`}>{m.label}</label>
            <input
              id={`mat-${m.id}`}
              type="number"
              className="prod-material-input"
              min={0}
              value={mats[m.id] ?? 0}
              onChange={(e) => setMats((prev) => ({ ...prev, [m.id]: parseInt(e.target.value) || 0 }))}
            />
          </div>
        ))}
      </div>

      <div className="prod-receitas-title">📋 Receitas &amp; Produção possível</div>
      <div style={{ overflowX: 'auto' }}>
        <table className="prod-receitas-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Ingredientes necessários</th>
              <th style={{ textAlign: 'center' }}>Pode produzir</th>
            </tr>
          </thead>
          <tbody>
            {receitasCalc.map((r) => (
              <tr key={r.nome}>
                <td className="prod-nome-cell">{r.emoji} {r.nome}</td>
                <td>
                  <div className="prod-ingredientes-cell">
                    {r.ings.map(([key, qtd_req]) => {
                      const disp = mats[key] || 0;
                      const cls = disp === 0 ? 'neutro' : (disp >= qtd_req ? 'ok' : 'falta');
                      const label = materiais.find((m) => m.id === key)?.label || key;
                      return (
                        <span key={key} className={`prod-ing-tag ${cls}`}>
                          {label}: <b>{disp}</b>/{qtd_req}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="prod-qtd-cell">
                  <span className={`prod-qtd-badge${r.maxProd > 0 ? ' ok' : ' zero'}`}>
                    {r.maxProd > 0 ? `✓ ${r.maxProd}x` : '✗ 0'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BolsaTab({ promo }: { promo: boolean }) {
  const [qtds, setQtds] = useState<Record<string, number>>(
    Object.fromEntries(BOLSA_ITENS.map(i => [i.id, 0]))
  );

  const totalPeso = BOLSA_ITENS.reduce((acc, i) => acc + (qtds[i.id] || 0) * i.peso, 0);
  const totalItensPreco = BOLSA_ITENS.reduce((acc, i) => acc + (qtds[i.id] || 0) * precoFinal(i.preco, promo), 0);
  const totalFinal = BOLSA_PRECO + totalItensPreco;
  const restante = Math.max(0, BOLSA_CAP - totalPeso);
  const overloaded = totalPeso > BOLSA_CAP;
  const pct = Math.min(100, (totalPeso / BOLSA_CAP) * 100);
  const totalItens = BOLSA_ITENS.reduce((acc, i) => acc + (qtds[i.id] || 0), 0);

  function handleZerar(e: React.MouseEvent) {
    setQtds(Object.fromEntries(BOLSA_ITENS.map(i => [i.id, 0])));
    spawnStars(e.clientX, e.clientY, 10);
  }

  return (
    <div className="farma-panel active">
      <div className="bolsa-header">
        <div className="bolsa-peso-info">
          <span className="bolsa-peso-label">Peso usado</span>
          <span className={`bolsa-peso-val${overloaded ? ' over' : ''}`}>
            {totalPeso.toFixed(2)} / {BOLSA_CAP} kg
          </span>
        </div>
        <div className="bolsa-bar-wrap">
          <div
            className={`bolsa-bar-fill${overloaded ? ' over' : ''}`}
            style={{ width: pct + '%' }}
          />
        </div>
        {overloaded && (
          <div className="bolsa-warn">⚠️ Peso excedido! Remova itens para ficar em até {BOLSA_CAP} kg.</div>
        )}
      </div>

      <table className="calc-table">
        <thead>
          <tr>
            <th className="calc-th">Item</th>
            <th className="calc-th">Peso (kg)</th>
            <th className="calc-th">Preço un.</th>
            <th className="calc-th">Qtd. na bolsa</th>
            <th className="calc-th">Subtotal</th>
            <th className="calc-th">Cabe mais nesta bolsa</th>
          </tr>
        </thead>
        <tbody>
          {BOLSA_ITENS.map(item => {
            const cabe = Math.floor(restante / item.peso);
            const pUnit = precoFinal(item.preco, promo);
            const subtotal = (qtds[item.id] || 0) * pUnit;
            return (
              <tr key={item.id}>
                <td className="calc-td product-name">{item.nome}</td>
                <td className="calc-td">{item.peso.toFixed(2)}</td>
                <td className="calc-td">
                  {promo && (
                    <span className="preco-original">$ {item.preco.toLocaleString('pt-BR')}</span>
                  )}
                  <span className={promo ? 'preco-promo' : ''}>$ {pUnit.toLocaleString('pt-BR')}</span>
                </td>
                <td className="calc-td">
                  <input
                    type="number"
                    className="calc-input"
                    min={0}
                    value={qtds[item.id]}
                    onChange={e => {
                      const val = Math.max(0, parseInt(e.target.value) || 0);
                      setQtds(q => ({ ...q, [item.id]: val }));
                    }}
                  />
                </td>
                <td className="calc-td" style={{ fontWeight: 700 }}>
                  {subtotal > 0 ? `$ ${subtotal.toLocaleString('pt-BR')}` : '—'}
                </td>
                <td className="calc-td">
                  <span className={`prod-qtd-badge${cabe > 0 ? ' ok' : ' zero'}`}>
                    {cabe > 0 ? `✓ ${cabe}` : '✗ 0'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="calc-actions">
        <button type="button" className="btn-zerar" onClick={handleZerar}>Limpar 🗑️</button>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {totalItens > 0 && (
            <div className="bolsa-resumo">
              🎒 {totalItens} {totalItens === 1 ? 'item' : 'itens'} · {totalPeso.toFixed(2)} kg
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              Bolsa $ {BOLSA_PRECO} + Itens $ {totalItensPreco.toLocaleString('pt-BR')}
            </div>
            <div className="calc-total-box">Total: $ {totalFinal.toLocaleString('pt-BR')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FarmaciaSection() {
  const [tab, setTab] = useState<'vendas' | 'producao' | 'bolsa'>('vendas');
  const [promo, setPromo] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([getProdutos(), getMateriais(), getReceitas()])
      .then(([p, m, r]) => {
        setProdutos(p);
        setMateriais(m);
        setReceitas(r);
      })
      .finally(() => setLoadingData(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Farmácia 💊</h2>
        <p>Controle de estoque e cálculo de vendas</p>
      </div>
      <div className="card">
        <div className="farma-topbar">
          <div className="farma-tab-bar">
            <button
              className={`farma-tab-btn${tab === 'vendas' ? ' active' : ''}`}
              onClick={() => setTab('vendas')}
            >
              🛒 Vendas
            </button>
            <button
              className={`farma-tab-btn${tab === 'producao' ? ' active' : ''}`}
              onClick={() => setTab('producao')}
            >
              🧪 Produção
            </button>
            <button
              className={`farma-tab-btn${tab === 'bolsa' ? ' active' : ''}`}
              onClick={() => setTab('bolsa')}
            >
              🎒 Bolsa
            </button>
          </div>

          {tab !== 'producao' && (
            <button
              className={`promo-toggle${promo ? ' active' : ''}`}
              onClick={() => setPromo(p => !p)}
              title="Aplica 10% de desconto nos itens (não inclui o valor da bolsa)"
            >
              🏷️ Promoção {promo ? 'ativa — 10% off' : 'inativa'}
            </button>
          )}
        </div>

        {loadingData ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
            Carregando dados…
          </div>
        ) : (
          <>
            {tab === 'vendas' && <VendasTab promo={promo} produtos={produtos} />}
            {tab === 'producao' && <ProducaoTab materiais={materiais} receitas={receitas} />}
            {tab === 'bolsa' && <BolsaTab promo={promo} />}
          </>
        )}
      </div>
    </div>
  );
}
