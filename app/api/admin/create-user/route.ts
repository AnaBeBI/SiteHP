import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data: profile } = await adminClient.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });

  const body = await request.json();
  const { email, nome, cargo, especialidade, tipo_cargo, hierarquia, is_admin } = body;

  if (!email || !nome || !cargo || !tipo_cargo) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
  }

  // Cria usuário via Admin API
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { nome, cargo, tipo_cargo, is_admin: is_admin ?? false },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Atualiza profile com campos extras (o trigger já criou a linha base)
  await adminClient.from('profiles').update({
    especialidade: especialidade || null,
    hierarquia: hierarquia || null,
    is_admin: is_admin ?? false,
  }).eq('id', data.user.id);

  // Envia email para o usuário definir a senha
  await adminClient.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('supabase.co', 'vercel.app') ?? ''}/auth/callback?next=/auth/reset`,
    },
  });

  return NextResponse.json({ id: data.user.id });
}
