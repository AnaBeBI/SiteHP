import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { LIMITE_PONTO_ATIVO_MS } from '@/lib/ponto';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const now = new Date();

  const { data: active } = await adminClient
    .from('pontos')
    .select('id, inicio')
    .eq('user_id', user.id)
    .is('fim', null)
    .order('inicio', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (active) {
    if (now.getTime() - new Date(active.inicio).getTime() >= LIMITE_PONTO_ATIVO_MS) {
      // Ponto esquecido aberto há 12h+: cancela antes de abrir um novo.
      await adminClient.from('pontos').delete().eq('id', active.id);
    } else {
      return NextResponse.json({ error: 'Você já tem um ponto em aberto.' }, { status: 400 });
    }
  }

  const { data, error } = await adminClient
    .from('pontos')
    .insert({ user_id: user.id, inicio: now.toISOString() })
    .select('id, inicio')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ active: data });
}
