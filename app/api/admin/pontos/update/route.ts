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

  const { id, inicio, fim } = await request.json();
  if (!id || !inicio) {
    return NextResponse.json({ error: 'id e início são obrigatórios' }, { status: 400 });
  }
  if (fim && new Date(fim).getTime() <= new Date(inicio).getTime()) {
    return NextResponse.json({ error: 'O fim precisa ser depois do início.' }, { status: 400 });
  }

  const { data, error } = await adminClient
    .from('pontos')
    .update({ inicio, fim: fim || null, editado_por: user.id, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, user_id, inicio, fim, criado_por, editado_por')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ponto: data });
}
