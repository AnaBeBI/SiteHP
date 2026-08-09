'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatDuration } from '@/lib/ponto';
import PontoAdminPanel from './PontoAdminPanel';

interface MeResponse {
  active: { id: string; inicio: string; countsInWeek: boolean; countsInMonth: boolean } | null;
  weekSeconds: number;
  monthSeconds: number;
  monthLabel: string;
}

function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function PontoSection() {
  const { profile } = useAuth();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(Date.now());
  const [adminView, setAdminView] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/ponto/me');
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Cronômetro visual enquanto o ponto está ativo
  useEffect(() => {
    if (!data?.active) return;
    const t = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, [data?.active]);

  // Ressincroniza com o servidor periodicamente (também detecta o cancelamento automático de 12h)
  useEffect(() => {
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  async function handleStart() {
    setBusy(true); setError('');
    const res = await fetch('/api/ponto/start', { method: 'POST' });
    const json = await res.json();
    if (res.ok) await load();
    else setError(json.error || 'Erro ao iniciar ponto.');
    setBusy(false);
  }

  async function handleStop() {
    if (!data?.active) return;
    setBusy(true); setError('');
    const res = await fetch('/api/ponto/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: data.active.id }),
    });
    const json = await res.json();
    if (res.ok) {
      if (json.cancelled) setError('O ponto ficou ativo por 12h ou mais e foi cancelado automaticamente — não foi salvo.');
      await load();
    } else {
      setError(json.error || 'Erro ao encerrar ponto.');
    }
    setBusy(false);
  }

  if (adminView) {
    return <PontoAdminPanel onBack={() => { setAdminView(false); load(); }} />;
  }

  const elapsedLive = data?.active ? (tick - new Date(data.active.inicio).getTime()) / 1000 : 0;
  const weekTotal = (data?.weekSeconds ?? 0) + (data?.active?.countsInWeek ? elapsedLive : 0);
  const monthTotal = (data?.monthSeconds ?? 0) + (data?.active?.countsInMonth ? elapsedLive : 0);

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <div className="page-header">
        <h2>⏱️ Ponto Eletrônico</h2>
        <p>Registro de entrada e saída do plantão</p>
      </div>

      {profile?.is_admin && (
        <div style={{ marginBottom: 16 }}>
          <button className="gen-btn secondary" onClick={() => setAdminView(true)}>
            🛠 Administração de Pontos
          </button>
        </div>
      )}

      {error && <div className="gen-msg gen-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card ponto-clock-card">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Carregando…</p>
        ) : data?.active ? (
          <>
            <div className="ponto-status ponto-status-active">🟢 Ponto em andamento</div>
            <div className="ponto-clock">{formatClock(elapsedLive)}</div>
            <button className="gen-btn danger" onClick={handleStop} disabled={busy}>
              {busy ? '…' : '⏹ Parar'}
            </button>
          </>
        ) : (
          <>
            <div className="ponto-status">⚪ Nenhum ponto ativo</div>
            <button className="gen-btn primary" onClick={handleStart} disabled={busy}>
              {busy ? '…' : '▶ Iniciar'}
            </button>
          </>
        )}
      </div>

      <div className="ponto-stats-grid">
        <div className="ponto-stat-tile">
          <div className="ponto-stat-label">Horas na semana</div>
          <div className="ponto-stat-value">{formatDuration(weekTotal)}</div>
          <div className="ponto-stat-sub">Segunda a domingo</div>
        </div>
        <div className="ponto-stat-tile">
          <div className="ponto-stat-label">Horas no mês</div>
          <div className="ponto-stat-value">{formatDuration(monthTotal)}</div>
          <div className="ponto-stat-sub" style={{ textTransform: 'capitalize' }}>{data?.monthLabel ?? ''}</div>
        </div>
      </div>
    </div>
  );
}
