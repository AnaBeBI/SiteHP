async function api(type: string, extra?: Record<string, string>) {
  const params = new URLSearchParams({ type, ...extra });
  const res = await fetch(`/api/data?${params}`);
  if (!res.ok) throw new Error(`data fetch failed: ${type}`);
  return res.json();
}

// ── Farmácia ──────────────────────────────────────────────────

export async function getProdutos() {
  const data = await api('produtos');
  return data as { id: string; nome: string; preco: number }[];
}

export async function getMateriais() {
  const data = await api('materiais');
  return data as { id: string; label: string }[];
}

export async function getReceitas() {
  const data = await api('receitas');
  return (data as {
    id: number; nome: string; emoji: string;
    receita_ingredientes: { material_id: string; quantidade: number }[];
  }[]).map(r => ({
    id: r.id,
    nome: r.nome,
    emoji: r.emoji,
    ingredientes: Object.fromEntries(
      r.receita_ingredientes.map(i => [i.material_id, i.quantidade])
    ) as Record<string, number>,
  }));
}

// ── Uniformes ─────────────────────────────────────────────────

export interface UniformeRow { label: string; fem: string; masc: string; muted?: boolean }
export interface Uniforme {
  id: number; nome: string; cat: string; bg: string;
  badge: string; badgeLabel: string; rows: UniformeRow[];
}

export async function getUniformes(): Promise<Uniforme[]> {
  const data = await api('uniformes');
  return (data as {
    id: number; nome: string; cat: string; bg: string;
    badge: string; badge_label: string;
    uniforme_itens: (UniformeRow & { ordem: number })[];
  }[]).map(u => ({
    id: u.id,
    nome: u.nome,
    cat: u.cat,
    bg: u.bg,
    badge: u.badge,
    badgeLabel: u.badge_label,
    rows: (u.uniforme_itens ?? [])
      .sort((a, b) => a.ordem - b.ordem)
      .map(({ label, fem, masc, muted }) => ({ label, fem, masc, muted: muted ?? false })),
  }));
}

// ── Laudo templates ───────────────────────────────────────────

export async function getLaudoTemplate(tipo: string, resultado: string): Promise<string> {
  const data = await api('laudo_template', { tipo, resultado });
  return (data as { texto?: string }).texto ?? '';
}

// ── Mapa de carreira ──────────────────────────────────────────

export interface CargoMapa {
  id: string; titulo: string; subtitulo: string;
  badge_classe: string; badge_label: string;
  salario: string; descricao: string; proximo_passo: string;
}
export interface Curso { id: number; cargo_id: string; nome: string; link: string | null }
export interface CargoProgressao { cargo_id: string; cargo_anterior_id: string }

export async function getCargosMapa() {
  const data = await api('cargos_mapa');
  return data as CargoMapa[];
}

export async function getCursos() {
  const data = await api('cursos');
  return data as Curso[];
}

export async function getCargoProgressao() {
  const data = await api('cargo_progressao');
  return data as CargoProgressao[];
}

// ── buildCoursesFor (client-side, dados já carregados) ────────

export function buildCoursesFor(
  roleId: string,
  progressao: CargoProgressao[],
  cursos: Curso[]
) {
  const chain = progressao
    .filter(p => p.cargo_id === roleId)
    .map(p => p.cargo_anterior_id);

  const seen = new Set<string>();
  const result: { n: string; link?: string; isNew: boolean }[] = [];

  chain.forEach(prev => {
    cursos.filter(c => c.cargo_id === prev).forEach(c => {
      if (!seen.has(c.nome)) {
        seen.add(c.nome);
        result.push({ n: c.nome, link: c.link ?? undefined, isNew: false });
      }
    });
  });

  cursos.filter(c => c.cargo_id === roleId).forEach(c => {
    if (!seen.has(c.nome)) {
      seen.add(c.nome);
      result.push({ n: c.nome, link: c.link ?? undefined, isNew: true });
    }
  });

  return result;
}
