import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function PUT(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data: profile } = await adminClient.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });

  const body = await request.json();
  const { userId, nome, cargo, especialidade, tipo_cargo, hierarquia, is_admin, gerar_laudo_psi } = body;

  if (!userId || !nome || !cargo || !tipo_cargo) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
  }

  if (userId === user.id && is_admin === false) {
    return NextResponse.json({ error: 'Você não pode remover seu próprio acesso de administrador.' }, { status: 400 });
  }

  const { error } = await adminClient.from('profiles').update({
    nome,
    cargo,
    especialidade: especialidade || null,
    tipo_cargo,
    hierarquia: hierarquia || null,
    is_admin: is_admin ?? false,
    gerar_laudo_psi: gerar_laudo_psi ?? false,
  }).eq('id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
