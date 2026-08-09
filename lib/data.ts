export const NAV_ITEMS = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'calculadora', icon: '💊', label: 'Farmácia' },
  { id: 'manuais', icon: '📚', label: 'Manuais de Cursos' },
  { id: 'gesso', icon: '🩹', label: 'Roupas de Gesso' },
  { id: 'animacoes', icon: '🎬', label: 'Animações' },
  { id: 'laudos', icon: '📄', label: 'Modelos de Laudos' },
  { id: 'psiquiatria', icon: '🧠', label: 'Psiquiatria' },
  { id: 'especializacoes', icon: '🩺', label: 'Especializações' },
  { id: 'certificados', icon: '🎓', label: 'Certificados' },
  { id: 'uniformes', icon: '👔', label: 'Uniformes' },
  { id: 'veiculos', icon: '🚑', label: 'Veículos' },
  { id: 'mapa', icon: '🗺️', label: 'Mapa de Progressão' },
  { id: 'ponto', icon: '⏱️', label: 'Ponto Eletrônico' },
] as const;

export type SectionId = typeof NAV_ITEMS[number]['id'];
