import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { LIMITE_PONTO_ATIVO_MS, getWeekRangeSP, getMonthRangeSP, getMonthLabelSP } from '@/lib/ponto';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function sumSeconds(rows: { inicio: string; fim: string | null }[]) {
  return rows.reduce((acc, r) => {
    if (!r.fim) return acc;
    return acc + (new Date(r.fim).getTime() - new Date(r.inicio).getTime()) / 1000;
  }, 0);
}

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const now = new Date();

  let { data: active } = await adminClient
    .from('pontos')
    .select('id, inicio')
    .eq('user_id', user.id)
    .is('fim', null)
    .order('inicio', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (active && now.getTime() - new Date(active.inicio).getTime() >= LIMITE_PONTO_ATIVO_MS) {
    // Ponto ficou ativo por 12h ou mais: cancela e não conta como registro.
    await adminClient.from('pontos').delete().eq('id', active.id);
    active = null;
  }

  const week = getWeekRangeSP(now);
  const month = getMonthRangeSP(now);
  const rangeStart = week.start < month.start ? week.start : month.start;

  const { data: rows } = await adminClient
    .from('pontos')
    .select('inicio, fim')
    .eq('user_id', user.id)
    .not('fim', 'is', null)
    .gte('inicio', rangeStart.toISOString());

  const all = rows ?? [];
  const weekSeconds = sumSeconds(all.filter(r => {
    const t = new Date(r.inicio).getTime();
    return t >= week.start.getTime() && t < week.end.getTime();
  }));
  const monthSeconds = sumSeconds(all.filter(r => {
    const t = new Date(r.inicio).getTime();
    return t >= month.start.getTime() && t < month.end.getTime();
  }));

  const activeOut = active ? {
    id: active.id,
    inicio: active.inicio,
    countsInWeek: new Date(active.inicio).getTime() >= week.start.getTime() && new Date(active.inicio).getTime() < week.end.getTime(),
    countsInMonth: new Date(active.inicio).getTime() >= month.start.getTime() && new Date(active.inicio).getTime() < month.end.getTime(),
  } : null;

  return NextResponse.json({
    active: activeOut,
    weekSeconds,
    monthSeconds,
    monthLabel: getMonthLabelSP(now),
  });
}
