'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('As senhas não coincidem.'); return; }
    if (password.length < 8) { setError('A senha deve ter pelo menos 8 caracteres.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError('Erro ao redefinir senha. Tente novamente.');
    else { router.push('/'); router.refresh(); }
    setLoading(false);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <Image src="/logo.png" alt="Logo" width={72} height={72} style={{ objectFit: 'contain' }} />
        </div>
        <h1 className="login-title">Redefinir Senha</h1>
        <p className="login-sub">Escolha uma nova senha de acesso</p>
        <form onSubmit={handleReset} className="login-form">
          <div className="login-field">
            <label>Nova senha</label>
            <input type="password" required placeholder="Mínimo 8 caracteres"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="login-field">
            <label>Confirmar senha</label>
            <input type="password" required placeholder="Repita a senha"
              value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Salvando…' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
