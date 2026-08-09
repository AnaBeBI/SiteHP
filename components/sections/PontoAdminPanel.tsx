'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Profile } from '@/context/AuthContext';

interface PontoRow {
  id: string;
  user_id: string;
  inicio: string;
  fim: string | null;
  criado_por: string | null;
  editado_por: string | null;
  profiles: { nome: string } | null;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string) {
  return new Date(value).toISOString();
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDuration(inicio: string, fim: string) {
  const s = Math.max(0, (new Date(fim).getTime() - new Date(inicio).getTime()) / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${pad(m)}m`;
}

export default function PontoAdminPanel({ onBack }: { onBack: () => void }) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [rows, setRows] = useState<PontoRow[]>([]);
  const [filterUser, setFilterUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; row?: PontoRow } | null>(null);
  const [modalForm, setModalForm] = useState({ userId: '', inicio: '', fim: '' });
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadRows = useCallback(async (userId: string) => {
    setLoading(true);
    const params = userId ? `?userId=${userId}` : '';
    const res = await fetch(`/api/admin/pontos/list${params}`);
    const json = await res.json();
    if (Array.isArray(json)) setRows(json as PontoRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch('/api/admin/list-users').then(r => r.json()).then(data => { if (Array.isArray(data)) setUsers(data as Profile[]); });
  }, []);

  useEffect(() => { loadRows(filterUser); }, [filterUser, loadRows]);

  function openCreate() {
    setModal({ mode: 'create' });
    setModalForm({ userId: users[0]?.id ?? '', inicio: toDatetimeLocal(new Date().toISOString()), fim: toDatetimeLocal(new Date().toISOString()) });
    setModalError('');
  }

  function openEdit(row: PontoRow) {
    setModal({ mode: 'edit', row });
    setModalForm({
      userId: row.user_id,
      inicio: toDatetimeLocal(row.inicio),
      fim: row.fim ? toDatetimeLocal(row.fim) : '',
    });
    setModalError('');
  }

  async function handleModalSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setModalError('');

    const inicioISO = fromDatetimeLocal(modalForm.inicio);
    const fimISO = modalForm.fim ? fromDatetimeLocal(modalForm.fim) : '';

    const res = modal?.mode === 'create'
      ? await fetch('/api/admin/pontos/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: modalForm.userId, inicio: inicioISO, fim: fimISO }),
        })
      : await fetch('/api/admin/pontos/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: modal?.row?.id, inicio: inicioISO, fim: fimISO }),
        });

    const json = await res.json();
    if (res.ok) {
      setMsg({ type: 'success', text: modal?.mode === 'create' ? 'Ponto adicionado com sucesso.' : 'Ponto corrigido com sucesso.' });
      setModal(null);
      loadRows(filterUser);
    } else {
      setModalError(json.error || 'Erro ao salvar.');
    }
    setSaving(false);
  }

  return (
    <div className="page" style={{ maxWidth: 1100 }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2>🛠 Administração de Pontos</h2>
          <p>Todos os registros de ponto eletrônico</p>
        </div>
        <button className="gen-btn secondary" onClick={onBack}>← Voltar</button>
      </div>

      {msg && <div className={`gen-msg ${msg.type === 'success' ? 'gen-success' : 'gen-error'}`} style={{ marginBottom: 16 }}>{msg.text}</div>}

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="gen-field" style={{ minWidth: 240 }}>
            <label>Filtrar por pessoa</label>
            <select value={filterUser} onChange={e => setFilterUser(e.target.value)} style={{ padding: '10px 12px', borderRadius: 9, border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, width: '100%' }}>
              <option value="">— Todas as pessoas —</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          </div>
          <button className="gen-btn primary" onClick={openCreate}>✚ Adicionar ponto manual</button>
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="calc-table">
            <thead>
              <tr>
                <th className="calc-th">Nome</th>
                <th className="calc-th">Início</th>
                <th className="calc-th">Fim</th>
                <th className="calc-th">Duração</th>
                <th className="calc-th" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="calc-td" colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)' }}>Carregando…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="calc-td" colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)' }}>Nenhum registro encontrado.</td></tr>
              ) : rows.map(r => (
                <tr key={r.id}>
                  <td className="calc-td" style={{ fontWeight: 600 }}>{r.profiles?.nome ?? '—'}</td>
                  <td className="calc-td">{formatDateTime(r.inicio)}</td>
                  <td className="calc-td">
                    {r.fim ? formatDateTime(r.fim) : <span style={{ color: 'var(--accent)', fontWeight: 600 }}>🟢 Em andamento</span>}
                  </td>
                  <td className="calc-td">{r.fim ? formatDuration(r.inicio, r.fim) : '—'}</td>
                  <td className="calc-td">
                    <button
                      onClick={() => openEdit(r)}
                      style={{
                        padding: '5px 12px', borderRadius: 7, border: 'none',
                        background: 'transparent', color: 'var(--accent)',
                        fontFamily: '"DM Sans",sans-serif', fontSize: 12,
                        fontWeight: 600, cursor: 'pointer', transition: 'background .15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(83,74,183,.1)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div
          onClick={() => !saving && setModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
        >
          <div onClick={e => e.stopPropagation()} className="card" style={{ padding: 0, overflow: 'hidden', width: '100%', maxWidth: 480 }}>
            <div className="gen-header">
              <div>
                <div className="gen-header-title">{modal.mode === 'create' ? 'Adicionar Ponto Manual' : 'Corrigir Ponto'}</div>
                <div className="gen-header-sub">{modal.mode === 'create' ? 'Lançamento manual de correção' : modal.row?.profiles?.nome}</div>
              </div>
            </div>
            <div className="gen-body">
              {modalError && <div className="gen-msg gen-error">{modalError}</div>}
              <form onSubmit={handleModalSubmit}>
                <div className="gen-section">
                  {modal.mode === 'create' && (
                    <div className="gen-field" style={{ marginBottom: 12 }}>
                      <label>Usuário</label>
                      <select value={modalForm.userId} onChange={e => setModalForm(f => ({ ...f, userId: e.target.value }))} style={{ padding: '10px 12px', borderRadius: 9, border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, width: '100%' }}>
                        {users.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="gen-grid">
                    <div className="gen-field">
                      <label htmlFor="ponto-inicio">Início</label>
                      <input id="ponto-inicio" type="datetime-local" value={modalForm.inicio}
                        onChange={e => setModalForm(f => ({ ...f, inicio: e.target.value }))} />
                    </div>
                    <div className="gen-field">
                      <label htmlFor="ponto-fim">Fim {modal.mode === 'edit' && '(vazio = em andamento)'}</label>
                      <input id="ponto-fim" type="datetime-local" value={modalForm.fim}
                        onChange={e => setModalForm(f => ({ ...f, fim: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="gen-actions">
                  <button type="button" className="gen-btn secondary" onClick={() => setModal(null)} disabled={saving}>Cancelar</button>
                  <button type="submit" className="gen-btn primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
