'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('E-mail ou senha incorretos. Verifique os dados e tente novamente.');
    } else {
      router.push('/');
      router.refresh();
    }
    setLoading(false);
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset`,
    });
    if (error) setError('Erro ao enviar e-mail. Verifique o endereço informado.');
    else setSuccess('Link de recuperação enviado! Verifique sua caixa de entrada.');
    setLoading(false);
  }

  return (
    <div className="login-wrap">
      <div className="login-card">

        <div className="login-card-head">
          <div className="login-logo-box">
            <Image src="/logo.png" alt="Logo Hospital Andrea Silva" width={56} height={56} style={{ objectFit: 'contain' }} />
          </div>
          <div>
            <h1 className="login-card-title">Hospital Andrea Silva</h1>
            <p className="login-card-sub">Sistema de Gestão Hospitalar</p>
          </div>
        </div>

        <div className="login-body">
          {mode === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="login-field">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email" type="email" required autoComplete="email"
                  placeholder="seu@email.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="login-field">
                <label htmlFor="password">Senha</label>
                <input
                  id="password" type="password" required autoComplete="current-password"
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
              </div>

              {error && <div className="login-msg login-msg-error">{error}</div>}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Entrando…' : 'Entrar'}
              </button>
              <button type="button" className="login-link" onClick={() => { setMode('forgot'); setError(''); }}>
                Esqueci minha senha
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgot}>
              <p className="login-recover-info">
                Informe seu e-mail para receber o link de recuperação de senha.
              </p>
              <div className="login-field">
                <label htmlFor="email-rec">E-mail</label>
                <input
                  id="email-rec" type="email" required autoComplete="email"
                  placeholder="seu@email.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>

              {error && <div className="login-msg login-msg-error">{error}</div>}
              {success && <div className="login-msg login-msg-success">{success}</div>}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Enviando…' : 'Enviar link'}
              </button>
              <button type="button" className="login-link" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
                ← Voltar ao login
              </button>
            </form>
          )}

          <p className="login-note">Acesso restrito a colaboradores autorizados.</p>
        </div>

      </div>
    </div>
  );
}
