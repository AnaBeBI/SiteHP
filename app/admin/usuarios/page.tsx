'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import type { Profile } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';

const CARGOS = [
  'Supervisor','Diretor','Estagiário','Tec. Enfermagem','Enfermeiro',
  'Residente','Médico','Socorrista','Paramédico','Resgatista','Médico SAMU',
];
const ESPECIALIDADES = ['Clínico Geral','Cirurgia Geral','Patologia','Psiquiatra','Radiologia'];
const TIPOS = ['Geral','Interno','Externo'];
const HIERARQUIAS = ['Chefe'];

export default function AdminUsuariosPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<Profile[]>([]);
  const [form, setForm] = useState({ email:'', nome:'', cargo:'Estagiário', especialidade:'', tipo_cargo:'Geral', hierarquia:'', is_admin: false, gerar_laudo_psi: false });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success'|'error'; text: string } | null>(null);

  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState({ nome:'', cargo:'Estagiário', especialidade:'', tipo_cargo:'Geral', hierarquia:'', is_admin: false, gerar_laudo_psi: false });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (!loading && (!profile || !profile.is_admin)) router.replace('/');
  }, [loading, profile, router]);

  useEffect(() => {
    if (profile?.is_admin) {
      fetch('/api/admin/list-users')
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setUsers(data as Profile[]); });
    }
  }, [profile]);

  async function handleDelete(userId: string, nome: string) {
    if (!confirm(`Excluir o usuário "${nome}"? Esta ação não pode ser desfeita.`)) return;
    setDeleting(userId);
    const res = await fetch('/api/admin/delete-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const json = await res.json();
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      setMsg({ type: 'success', text: `Usuário "${nome}" excluído com sucesso.` });
    } else {
      setMsg({ type: 'error', text: json.error || 'Erro ao excluir usuário.' });
    }
    setDeleting(null);
  }

  function openEdit(u: Profile) {
    setEditUser(u);
    setEditForm({
      nome: u.nome,
      cargo: u.cargo,
      especialidade: u.especialidade || '',
      tipo_cargo: u.tipo_cargo,
      hierarquia: u.hierarquia || '',
      is_admin: u.is_admin,
      gerar_laudo_psi: u.gerar_laudo_psi,
    });
    setEditError('');
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setEditSubmitting(true); setEditError('');
    const res = await fetch('/api/admin/update-user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: editUser.id, ...editForm }),
    });
    const json = await res.json();
    if (res.ok) {
      setMsg({ type: 'success', text: `Usuário "${editForm.nome}" atualizado com sucesso.` });
      setEditUser(null);
      const data = await fetch('/api/admin/list-users').then(r => r.json());
      if (Array.isArray(data)) setUsers(data as Profile[]);
    } else {
      setEditError(json.error || 'Erro ao atualizar usuário.');
    }
    setEditSubmitting(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setMsg(null);
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (res.ok) {
      setMsg({ type: 'success', text: `Usuário criado! Um e-mail de recuperação foi enviado para ${form.email}.` });
      setForm({ email:'', nome:'', cargo:'Estagiário', especialidade:'', tipo_cargo:'Geral', hierarquia:'', is_admin: false, gerar_laudo_psi: false });
      const data = await fetch('/api/admin/list-users').then(r => r.json());
      if (Array.isArray(data)) setUsers(data as Profile[]);
    } else {
      setMsg({ type: 'error', text: json.error || 'Erro ao criar usuário.' });
    }
    setSubmitting(false);
  }

  function field<K extends keyof typeof form>(id: K, label: string, type = 'text') {
    return (
      <div className="gen-field">
        <label htmlFor={id}>{label}</label>
        <input id={id} type={type} value={String(form[id])}
          onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))} />
      </div>
    );
  }

  if (loading || !profile?.is_admin) return null;

  return (
    <AppShell activeSection="admin">
    <div className="page" style={{ maxWidth: 900 }}>
      <div className="page-header">
        <h2>👥 Gerenciar Usuários</h2>
        <p>Criação de acessos ao sistema hospitalar</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <div className="gen-header">
          <div><div className="gen-header-title">Novo Usuário</div><div className="gen-header-sub">O usuário receberá e-mail para definir a senha.</div></div>
        </div>
        <div className="gen-body">
          {msg && <div className={`gen-msg ${msg.type === 'success' ? 'gen-success' : 'gen-error'}`}>{msg.text}</div>}
          <form onSubmit={handleSubmit}>
            <div className="gen-section">
              <div className="gen-section-title">Dados Pessoais</div>
              <div className="gen-grid">
                {field('nome', 'Nome Completo')}
                {field('email', 'E-mail', 'email')}
              </div>
            </div>
            <div className="gen-section">
              <div className="gen-section-title">Cargo & Permissões</div>
              <div className="gen-grid">
                <div className="gen-field">
                  <label>Cargo</label>
                  <select value={form.cargo} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} style={{ padding: '10px 12px', borderRadius: 9, border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13 }}>
                    {CARGOS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="gen-field">
                  <label>Especialidade (opcional)</label>
                  <select value={form.especialidade} onChange={e => setForm(f => ({ ...f, especialidade: e.target.value }))} style={{ padding: '10px 12px', borderRadius: 9, border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13 }}>
                    <option value="">— Sem especialidade —</option>
                    {ESPECIALIDADES.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div className="gen-field">
                  <label>Tipo de Cargo</label>
                  <select value={form.tipo_cargo} onChange={e => setForm(f => ({ ...f, tipo_cargo: e.target.value }))} style={{ padding: '10px 12px', borderRadius: 9, border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13 }}>
                    {TIPOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="gen-field">
                  <label>Hierarquia (opcional)</label>
                  <select value={form.hierarquia} onChange={e => setForm(f => ({ ...f, hierarquia: e.target.value }))} style={{ padding: '10px 12px', borderRadius: 9, border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13 }}>
                    <option value="">— Sem hierarquia —</option>
                    {HIERARQUIAS.map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label className="gen-radio-label">
                  <input type="checkbox" checked={form.is_admin} onChange={e => setForm(f => ({ ...f, is_admin: e.target.checked }))} style={{ width: 16, height: 16 }} />
                  Administrador do sistema (acesso total)
                </label>
                <label className="gen-radio-label">
                  <input type="checkbox" checked={form.gerar_laudo_psi} onChange={e => setForm(f => ({ ...f, gerar_laudo_psi: e.target.checked }))} style={{ width: 16, height: 16 }} />
                  Pode gerar laudo de Psiquiatria
                </label>
              </div>
            </div>
            <div className="gen-actions">
              <button type="submit" className="gen-btn primary" disabled={submitting}>
                {submitting ? 'Criando…' : '✚ Criar usuário'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--muted)', marginBottom: 16 }}>
          Usuários cadastrados ({users.length})
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="calc-table">
            <thead>
              <tr>
                <th className="calc-th">Nome</th>
                <th className="calc-th">Cargo</th>
                <th className="calc-th">Especialidade</th>
                <th className="calc-th">Tipo</th>
                <th className="calc-th">Hierarquia</th>
                <th className="calc-th">Admin</th>
                <th className="calc-th">Laudo Psi</th>
                <th className="calc-th" />
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="calc-td" style={{ fontWeight: 600 }}>{u.nome}</td>
                  <td className="calc-td">{u.cargo}</td>
                  <td className="calc-td">{u.especialidade || '—'}</td>
                  <td className="calc-td">{u.tipo_cargo}</td>
                  <td className="calc-td">{u.hierarquia || '—'}</td>
                  <td className="calc-td">{u.is_admin ? '✓' : ''}</td>
                  <td className="calc-td">{u.gerar_laudo_psi ? '✓' : ''}</td>
                  <td className="calc-td" style={{ whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => openEdit(u)}
                      style={{
                        padding: '5px 12px', borderRadius: 7, border: 'none',
                        background: 'transparent', color: 'var(--accent)',
                        fontFamily: '"DM Sans",sans-serif', fontSize: 12,
                        fontWeight: 600, cursor: 'pointer',
                        transition: 'background .15s, color .15s',
                        marginRight: 4,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(83,74,183,.1)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      Editar
                    </button>
                    {u.id !== profile.id && (
                      <button
                        onClick={() => handleDelete(u.id, u.nome)}
                        disabled={deleting === u.id}
                        style={{
                          padding: '5px 12px', borderRadius: 7, border: 'none',
                          background: 'transparent', color: 'var(--coral)',
                          fontFamily: '"DM Sans",sans-serif', fontSize: 12,
                          fontWeight: 600, cursor: 'pointer',
                          transition: 'background .15s, color .15s',
                          opacity: deleting === u.id ? .5 : 1,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(216,90,48,.1)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {deleting === u.id ? '…' : 'Excluir'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {editUser && (
      <div
        onClick={() => !editSubmitting && setEditUser(null)}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16,
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          className="card"
          style={{ padding: 0, overflow: 'hidden', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}
        >
          <div className="gen-header">
            <div>
              <div className="gen-header-title">Editar Usuário</div>
              <div className="gen-header-sub">{editUser.nome}</div>
            </div>
          </div>
          <div className="gen-body">
            {editError && <div className="gen-msg gen-error">{editError}</div>}
            <form onSubmit={handleEditSubmit}>
              <div className="gen-section">
                <div className="gen-section-title">Dados Pessoais</div>
                <div className="gen-grid">
                  <div className="gen-field">
                    <label htmlFor="edit-nome">Nome Completo</label>
                    <input id="edit-nome" type="text" value={editForm.nome}
                      onChange={e => setEditForm(f => ({ ...f, nome: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="gen-section">
                <div className="gen-section-title">Cargo & Permissões</div>
                <div className="gen-grid">
                  <div className="gen-field">
                    <label>Cargo</label>
                    <select value={editForm.cargo} onChange={e => setEditForm(f => ({ ...f, cargo: e.target.value }))} style={{ padding: '10px 12px', borderRadius: 9, border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13 }}>
                      {CARGOS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="gen-field">
                    <label>Especialidade (opcional)</label>
                    <select value={editForm.especialidade} onChange={e => setEditForm(f => ({ ...f, especialidade: e.target.value }))} style={{ padding: '10px 12px', borderRadius: 9, border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13 }}>
                      <option value="">— Sem especialidade —</option>
                      {ESPECIALIDADES.map(e => <option key={e}>{e}</option>)}
                    </select>
                  </div>
                  <div className="gen-field">
                    <label>Tipo de Cargo</label>
                    <select value={editForm.tipo_cargo} onChange={e => setEditForm(f => ({ ...f, tipo_cargo: e.target.value }))} style={{ padding: '10px 12px', borderRadius: 9, border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13 }}>
                      {TIPOS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="gen-field">
                    <label>Hierarquia (opcional)</label>
                    <select value={editForm.hierarquia} onChange={e => setEditForm(f => ({ ...f, hierarquia: e.target.value }))} style={{ padding: '10px 12px', borderRadius: 9, border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13 }}>
                      <option value="">— Sem hierarquia —</option>
                      {HIERARQUIAS.map(h => <option key={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label className="gen-radio-label">
                    <input type="checkbox" checked={editForm.is_admin}
                      disabled={editUser.id === profile.id}
                      onChange={e => setEditForm(f => ({ ...f, is_admin: e.target.checked }))}
                      style={{ width: 16, height: 16 }} />
                    Administrador do sistema (acesso total)
                  </label>
                  <label className="gen-radio-label">
                    <input type="checkbox" checked={editForm.gerar_laudo_psi}
                      onChange={e => setEditForm(f => ({ ...f, gerar_laudo_psi: e.target.checked }))}
                      style={{ width: 16, height: 16 }} />
                    Pode gerar laudo de Psiquiatria
                  </label>
                </div>
              </div>
              <div className="gen-actions">
                <button type="button" className="gen-btn secondary" onClick={() => setEditUser(null)} disabled={editSubmitting}>
                  Cancelar
                </button>
                <button type="submit" className="gen-btn primary" disabled={editSubmitting}>
                  {editSubmitting ? 'Salvando…' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
    </AppShell>
  );
}
