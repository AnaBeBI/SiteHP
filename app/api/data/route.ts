import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  switch (type) {
    case 'produtos': {
      const { data } = await adminClient.from('produtos').select('*').order('nome');
      return NextResponse.json(data ?? []);
    }
    case 'materiais': {
      const { data } = await adminClient.from('materiais').select('*').order('label');
      return NextResponse.json(data ?? []);
    }
    case 'receitas': {
      const { data } = await adminClient
        .from('receitas')
        .select('id, nome, emoji, receita_ingredientes(material_id, quantidade)')
        .order('nome');
      return NextResponse.json(data ?? []);
    }
    case 'uniformes': {
      const { data } = await adminClient
        .from('uniformes')
        .select('*, uniforme_itens(label, fem, masc, muted, ordem)')
        .order('id');
      return NextResponse.json(data ?? []);
    }
    case 'cargos_mapa': {
      const { data } = await adminClient.from('cargos_mapa').select('*');
      return NextResponse.json(data ?? []);
    }
    case 'cursos': {
      const { data } = await adminClient.from('cursos').select('*').order('id');
      return NextResponse.json(data ?? []);
    }
    case 'cargo_progressao': {
      const { data } = await adminClient.from('cargo_progressao').select('*');
      return NextResponse.json(data ?? []);
    }
    case 'laudo_template': {
      const { data: profile } = await adminClient.from('profiles').select('is_admin, gerar_laudo_psi').eq('id', user.id).single();
      if (!profile?.is_admin && !profile?.gerar_laudo_psi) {
        return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
      }
      const tipo = searchParams.get('tipo');
      const resultado = searchParams.get('resultado');
      if (!tipo || !resultado) return NextResponse.json({ texto: '' });
      const { data } = await adminClient
        .from('laudo_templates')
        .select('texto')
        .eq('tipo', tipo)
        .eq('resultado', resultado)
        .single();
      return NextResponse.json(data ?? { texto: '' });
    }
    default:
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
  }
}
