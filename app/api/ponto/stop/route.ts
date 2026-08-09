import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { LIMITE_PONTO_ATIVO_MS } from '@/lib/ponto';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });

  const { data: ponto } = await adminClient
    .from('pontos')
    .select('id, user_id, inicio, fim')
    .eq('id', id)
    .single();

  if (!ponto || ponto.user_id !== user.id) {
    return NextResponse.json({ error: 'Ponto não encontrado.' }, { status: 404 });
  }
  if (ponto.fim) {
    return NextResponse.json({ error: 'Esse ponto já foi encerrado.' }, { status: 400 });
  }

  const now = new Date();
  const elapsedMs = now.getTime() - new Date(ponto.inicio).getTime();

  if (elapsedMs >= LIMITE_PONTO_ATIVO_MS) {
    // Ficou ativo 12h ou mais: cancela e não salva.
    await adminClient.from('pontos').delete().eq('id', id);
    return NextResponse.json({ cancelled: true });
  }

  const { data, error } = await adminClient
    .from('pontos')
    .update({ fim: now.toISOString(), updated_at: now.toISOString() })
    .eq('id', id)
    .select('id, inicio, fim')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ponto: data });
}
